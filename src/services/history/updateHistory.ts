
import { db } from '@/db';
import { history, dailySchedule, teachers, classes, subjects, schools } from '@/db/schema';
import { eq, inArray, arrayContains, and } from 'drizzle-orm';

interface HistoryUpdateResult {
    success: boolean;
    logs: string[];
    schoolsUpdated: number;
    recordsCount: number;
}

export async function processHistoryUpdate(dateString?: string, force: boolean = false): Promise<HistoryUpdateResult> {
    const logs: string[] = [];
    const log = (msg: string) => {
        console.log(msg);
        logs.push(msg);
    };

    try {
        // 1. Determine "Today" if date not provided
        let targetDate = dateString;
        if (!targetDate) {
            const today = new Date();
            // Default is now Today (per user request), usually run afterschool hours or manually
            targetDate = today.toISOString().split('T')[0];
        }

        log(`Processing history for date: ${targetDate}${force ? ' (Force Mode)' : ''}`);

        // 2. Find schools that have published this date
        let schoolsQuery = db
            .select({ id: schools.id, name: schools.name })
            .from(schools);

        if (!force) {
            schoolsQuery.where(arrayContains(schools.publishDates, [targetDate]));
        }

        const publishedSchools = await schoolsQuery;

        if (publishedSchools.length === 0) {
            log(`No schools found ${force ? '' : `with published schedule `}for ${targetDate}`);
            return { success: true, logs, schoolsUpdated: 0, recordsCount: 0 };
        }

        const publishedSchoolIds = publishedSchools.map(s => s.id);
        const publishedSchoolNames = publishedSchools.map(s => s.name).join(', ');
        log(`Found ${publishedSchoolIds.length} schools${force ? '' : ' with published schedule'}: ${publishedSchoolNames}`);

        // 3. Fetch daily schedules
        const schedules = await db
            .select()
            .from(dailySchedule)
            .where(
                and(
                    eq(dailySchedule.date, targetDate),
                    inArray(dailySchedule.schoolId, publishedSchoolIds)
                )
            );

        if (schedules.length === 0) {
            log('No schedules found to archive.');
            return { success: true, logs, schoolsUpdated: publishedSchoolIds.length, recordsCount: 0 };
        }

        log(`Found ${schedules.length} schedule records to archive.`);

        // 4. Fetch reference data
        const allTeachers = await db.select({ id: teachers.id, name: teachers.name }).from(teachers);
        const allSubjects = await db.select({ id: subjects.id, name: subjects.name }).from(subjects);
        const allClasses = await db.select({ id: classes.id, name: classes.name }).from(classes);

        const teacherMap = new Map(allTeachers.map(t => [t.id, t.name]));
        const subjectMap = new Map(allSubjects.map(s => [s.id, s.name]));
        const classMap = new Map(allClasses.map(c => [c.id, c.name]));

        const historyRecords = schedules.map(schedule => {
            const getTeacherName = (id: string | null) => id ? teacherMap.get(id) || null : null;
            const getSubjectName = (id: string | null) => id ? subjectMap.get(id) || null : null;

            const classNames = schedule.classIds
                ? schedule.classIds.map(id => classMap.get(id)).filter((name): name is string => !!name)
                : null;

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
                classes: classNames ? classNames.join(', ') : null,
                subject: getSubjectName(schedule.subjectId),
                subTeacher: getTeacherName(schedule.subTeacherId),
                instructions: schedule.instructions,
                eventTitle: schedule.eventTitle,
                eventText: schedule.event,
            };
        });

        if (historyRecords.length > 0) {
            // 5. Delete existing records to prevent duplicates
            await db.delete(history)
                .where(
                    and(
                        eq(history.date, targetDate),
                        inArray(history.schoolId, publishedSchoolIds)
                    )
                );
            log(`Deleted existing history records for ${targetDate} for ${publishedSchoolIds.length} schools.`);

            await db.insert(history).values(historyRecords);
            log(`Successfully inserted ${historyRecords.length} records into history.`);
        }

        return {
            success: true,
            logs,
            schoolsUpdated: publishedSchoolIds.length,
            recordsCount: historyRecords.length
        };

    } catch (error) {
        console.error('History update failed:', error);
        log(`Error: ${error instanceof Error ? error.message : String(error)}`);
        return { success: false, logs, schoolsUpdated: 0, recordsCount: 0 };
    }
}
