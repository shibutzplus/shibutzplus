import { NextResponse } from 'next/server';
import { db } from '@/db';
import { history, dailySchedule, teachers, classes, subjects, schools } from '@/db/schema';
import { eq, inArray, arrayContains, and } from 'drizzle-orm';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        // 1. Determine "Yesterday"
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const dateString = yesterday.toISOString().split('T')[0]; // YYYY-MM-DD

        console.log(`Processing history for date: ${dateString}`);

        // 2. Find schools that have published this date
        // 'publishDates' is a text array in the DB: publishDates: text('publish_dates').array()...
        const publishedSchools = await db
            .select({ id: schools.id })
            .from(schools)
            .where(arrayContains(schools.publishDates, [dateString]));

        if (publishedSchools.length === 0) {
            console.log(`No schools found with published schedule for ${dateString}`);
            return NextResponse.json({ success: true, message: `No published schools for ${dateString}` });
        }

        const publishedSchoolIds = publishedSchools.map(s => s.id);

        // 3. Fetch daily schedules for the target date AND only for published schools
        const schedules = await db
            .select()
            .from(dailySchedule)
            .where(
                and(
                    eq(dailySchedule.date, dateString),
                    inArray(dailySchedule.schoolId, publishedSchoolIds)
                )
            );

        if (schedules.length === 0) {
            console.log('No schedules found to archive.');
            return NextResponse.json({ success: true, message: 'No schedules to update' });
        }

        // 4. Fetch all necessary reference data for mapping
        // Optimization: We could filter these by the relevant schoolIds too, but fetching all is likely fine for now.
        const allTeachers = await db.select({ id: teachers.id, name: teachers.name }).from(teachers);
        const allSubjects = await db.select({ id: subjects.id, name: subjects.name }).from(subjects);
        const allClasses = await db.select({ id: classes.id, name: classes.name }).from(classes);

        // Create lookup maps
        const teacherMap = new Map(allTeachers.map(t => [t.id, t.name]));
        const subjectMap = new Map(allSubjects.map(s => [s.id, s.name]));
        const classMap = new Map(allClasses.map(c => [c.id, c.name]));

        const historyRecords = schedules.map(schedule => {
            // Helper to safe get name
            const getTeacherName = (id: string | null) => id ? teacherMap.get(id) || null : null;
            const getSubjectName = (id: string | null) => id ? subjectMap.get(id) || null : null;

            // Map class IDs to names
            const classNames = schedule.classIds
                ? schedule.classIds.map(id => classMap.get(id)).filter((name): name is string => !!name)
                : null;

            // Map issueTeacherType string to integer
            // 0 - missingTeacher, 1 - existingTeacher, 2 - event
            let columnType = 0;
            switch (schedule.issueTeacherType) {
                case 'missingTeacher': columnType = 0; break;
                case 'existingTeacher': columnType = 1; break;
                case 'event': columnType = 2; break;
                default: columnType = 0;
            }

            const dayInt = parseInt(schedule.day, 10) || 0;

            return {
                schoolId: schedule.schoolId,
                date: schedule.date,
                day: dayInt,
                hour: schedule.hour,
                columnId: schedule.columnId || '',
                columnPosition: schedule.position,
                columnType: columnType,
                originalTeacher: getTeacherName(schedule.issueTeacherId),
                classes: classNames,
                subject: getSubjectName(schedule.subjectId),
                subTeacher: getTeacherName(schedule.subTeacherId),
                instructions: schedule.instructions,
                eventTitle: schedule.eventTitle,
                eventText: schedule.event,
            };
        });

        if (historyRecords.length > 0) {
            // Bulk insert
            await db.insert(history).values(historyRecords);
        }

        return NextResponse.json({
            success: true,
            message: `History processed for ${dateString}`,
            schoolsUpdated: publishedSchoolIds.length,
            recordsCount: historyRecords.length
        });

    } catch (error) {
        console.error('Cron job failed:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}