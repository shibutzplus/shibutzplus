
import { db } from '@/db';
import { history, dailySchedule, teachers, classes, subjects, schools } from '@/db/schema';
import { eq, inArray, and, lte } from 'drizzle-orm';

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
            targetDate = today.toISOString().split('T')[0];
        }

        log(`Processing history for date: ${targetDate}${force ? ' (Force Mode)' : ''}`);

        // 2. Find ALL schools (regardless of publish status)
        const schoolsQuery = db
            .select({ id: schools.id, name: schools.name })
            .from(schools);

        const targetSchools = await schoolsQuery;

        if (targetSchools.length === 0) {
            return { success: true, logs, schoolsUpdated: 0, recordsCount: 0 };
        }

        const targetSchoolIds = targetSchools.map(s => s.id);
        const targetSchoolNames = targetSchools.map(s => s.name).join(', ');

        // 3. Fetch daily schedules
        const schedules = await db
            .select()
            .from(dailySchedule)
            .where(
                and(
                    eq(dailySchedule.date, targetDate),
                    inArray(dailySchedule.schoolId, targetSchoolIds)
                )
            );

        if (schedules.length === 0) {
            return { success: true, logs, schoolsUpdated: targetSchoolIds.length, recordsCount: 0 };
        }

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
                        inArray(history.schoolId, targetSchoolIds)
                    )
                );

            await db.insert(history).values(historyRecords);
            log(`Successfully inserted ${historyRecords.length} records into history.`);
        }

        // 6. Cleanup old daily schedules (4 days ago or older)
        const cleanupDate = new Date();
        cleanupDate.setDate(cleanupDate.getDate() - 4);
        const cleanupDateStr = cleanupDate.toISOString().split('T')[0];

        await db.delete(dailySchedule)
            .where(lte(dailySchedule.date, cleanupDateStr));

        log(`Cleanup: Removed dailySchedule records on or before ${cleanupDateStr}.`);

        return {
            success: true,
            logs,
            schoolsUpdated: targetSchoolIds.length,
            recordsCount: historyRecords.length
        };

    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('History update failed:', error);
        log(`Error: ${error instanceof Error ? error.message : String(error)}`);
        return { success: false, logs, schoolsUpdated: 0, recordsCount: 0 };
    }
}
