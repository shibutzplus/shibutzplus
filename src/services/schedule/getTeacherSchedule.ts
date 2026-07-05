/**
 * Used in Teacher Portal to display teacher schedule (material page)
 */
import { DailyScheduleType } from "@/models/types/dailySchedule";
import { and, eq, or, inArray } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db, schema } from "@/db";
import { unstable_cache } from "next/cache";
import { cacheTags } from "@/lib/cacheTags";

//
// called from getCachedTeacherSchedule
//
export async function getTeacherScheduleService(
    teacherId: string,
    date: string,
): Promise<DailyScheduleType[]> {
    // 1. Get Annual Schedule (to show regular schedule graid)
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay() + 1; // 1-7 (Sunday is 1)

    const originalTeacher = alias(schema.teachers, "originalTeacher");
    const subTeacher = alias(schema.teachers, "subTeacher");

    const [annualRows, dailyRows] = await Promise.all([
        // 1. Get Annual Schedule (to show regular schedule graid)
        db
            .select({
                id: schema.annualSchedule.id,
                day: schema.annualSchedule.day,
                hour: schema.annualSchedule.hour,
                createdAt: schema.annualSchedule.createdAt,
                updatedAt: schema.annualSchedule.updatedAt,
                school: schema.schools,
                class: schema.classes,
                subject: schema.subjects,
            })
            .from(schema.annualSchedule)
            .leftJoin(schema.schools, eq(schema.annualSchedule.schoolId, schema.schools.id))
            .leftJoin(schema.classes, eq(schema.annualSchedule.classId, schema.classes.id))
            .leftJoin(schema.subjects, eq(schema.annualSchedule.subjectId, schema.subjects.id))
            .where(and(
                eq(schema.annualSchedule.teacherId, teacherId),
                eq(schema.annualSchedule.day, dayOfWeek),
            )),

        // 2. Get daily schedule entries
        db
            .select({
                id: schema.dailySchedule.id,
                date: schema.dailySchedule.date,
                day: schema.dailySchedule.day,
                hour: schema.dailySchedule.hour,
                columnId: schema.dailySchedule.columnId,
                eventTitle: schema.dailySchedule.eventTitle,
                event: schema.dailySchedule.event,
                schoolId: schema.dailySchedule.schoolId,
                classIds: schema.dailySchedule.classIds,
                subjectId: schema.dailySchedule.subjectId,
                originalTeacherId: schema.dailySchedule.originalTeacherId,
                subTeacherId: schema.dailySchedule.subTeacherId,
                columnType: schema.dailySchedule.columnType,
                position: schema.dailySchedule.position,
                instructions: schema.dailySchedule.instructions,
                comment: schema.dailySchedule.comment,
                createdAt: schema.dailySchedule.createdAt,
                updatedAt: schema.dailySchedule.updatedAt,
                subject: schema.subjects,
                school: schema.schools,
                originalTeacher: originalTeacher,
                subTeacher: subTeacher,
            })
            .from(schema.dailySchedule)
            .leftJoin(schema.subjects, eq(schema.dailySchedule.subjectId, schema.subjects.id))
            .leftJoin(schema.schools, eq(schema.dailySchedule.schoolId, schema.schools.id))
            .leftJoin(originalTeacher, eq(schema.dailySchedule.originalTeacherId, originalTeacher.id))
            .leftJoin(subTeacher, eq(schema.dailySchedule.subTeacherId, subTeacher.id))
            .where(and(
                eq(schema.dailySchedule.date, date),
                or(
                    eq(schema.dailySchedule.subTeacherId, teacherId),
                    eq(schema.dailySchedule.originalTeacherId, teacherId),
                ),
            ))
            .orderBy(schema.dailySchedule.hour)
    ]);

    const annualSchedules = annualRows.map((r: any) => ({
        ...r,
        school: r.school && r.school.id ? r.school : null,
        class: r.class && r.class.id ? r.class : null,
        subject: r.subject && r.subject.id ? r.subject : null,
    }));

    const dailySchedules = dailyRows.map((r: any) => ({
        ...r,
        school: r.school && r.school.id ? r.school : null,
        subject: r.subject && r.subject.id ? r.subject : null,
        originalTeacher: r.originalTeacher && r.originalTeacher.id ? r.originalTeacher : null,
        subTeacher: r.subTeacher && r.subTeacher.id ? r.subTeacher : null,
    }));

    // Fetch classes array manually since it's an array of IDs
    const allClassIds = new Set<string>();
    dailySchedules.forEach((schedule: any) => {
        if (schedule.classIds && Array.isArray(schedule.classIds)) {
            schedule.classIds.forEach((id: string) => allClassIds.add(id));
        }
    });

    const classesData =
        allClassIds.size > 0
            ? await db
                .select()
                .from(schema.classes)
                .where(inArray(schema.classes.id, Array.from(allClassIds)))
            : [];

    const classesMap = new Map(classesData.map((c: any) => [c.id, c]));

    const getClasses = (schedule: any) => {
        if (
            schedule.classIds &&
            Array.isArray(schedule.classIds) &&
            schedule.classIds.length > 0
        ) {
            return schedule.classIds
                .map((id: string) => classesMap.get(id))
                .filter(Boolean);
        }
        return [];
    };

    const dailyMap = new Map<number, any>();
    dailySchedules.forEach((ds: any) => dailyMap.set(ds.hour, ds));

    const results: DailyScheduleType[] = [];
    // Process Annual Schedule First
    annualSchedules.forEach((annual: any) => {
        const hour = annual.hour;
        const dailyEntry = dailyMap.get(hour);

        // If there is ANY daily entry for this hour involving this teacher (as original or sub),
        // it overrides the annual schedule entry.
        const showAnnual = !dailyEntry;

        if (showAnnual) {
            results.push({
                id: annual.id,
                date: new Date(date),
                day: annual.day,
                hour: annual.hour,
                columnId: `annual-${annual.id}`,
                columnType: 1, // existingTeacher
                school: annual.school,
                classes: annual.class ? [annual.class] : [],
                subject: annual.subject,
                isRegular: true,
                position: 0,
                createdAt: annual.createdAt,
                updatedAt: annual.updatedAt,
            });
        }
    });

    // Process Daily Schedules
    const hours = dailySchedules.map((ds: any) => ds.hour);
    let chainSchedules: any[] = [];
    if (hours.length > 0) {
        const rows = await db
            .select({
                id: schema.dailySchedule.id,
                date: schema.dailySchedule.date,
                day: schema.dailySchedule.day,
                hour: schema.dailySchedule.hour,
                originalTeacherId: schema.dailySchedule.originalTeacherId,
                subTeacherId: schema.dailySchedule.subTeacherId,
                originalTeacher: originalTeacher,
                subTeacher: subTeacher,
            })
            .from(schema.dailySchedule)
            .leftJoin(originalTeacher, eq(schema.dailySchedule.originalTeacherId, originalTeacher.id))
            .leftJoin(subTeacher, eq(schema.dailySchedule.subTeacherId, subTeacher.id))
            .where(and(
                eq(schema.dailySchedule.date, date),
                inArray(schema.dailySchedule.hour, hours),
            ));

        chainSchedules = rows.map((r: any) => ({
            ...r,
            originalTeacher: r.originalTeacher && r.originalTeacher.id ? r.originalTeacher : null,
            subTeacher: r.subTeacher && r.subTeacher.id ? r.subTeacher : null,
        }));
    }

    dailySchedules.forEach((ds: any) => {
        const isSub = ds.subTeacherId === teacherId;
        const isOriginal = ds.originalTeacherId === teacherId;
        const isReplaced = ds.subTeacherId && ds.subTeacherId !== teacherId;

        // Show daily item if:
        // 1. I am the substitute teacher
        // 2. I am the original teacher (even if replaced, so I can see "Replaced by X")
        if (isSub || isOriginal) {
            const otherEntries = chainSchedules.filter((c: any) => c.hour === ds.hour && c.id !== ds.id);

            let isChainOriginalReplacing = false;
            let isChainSubReplaced = false;
            let chainTeacherName: string | undefined = undefined;

            if (isSub) {
                // 1. Am I (B) also being replaced in another entry at this hour? (A -> B -> C)
                const otherReplaced = otherEntries.find((c: any) => 
                    c.originalTeacherId === teacherId && 
                    c.subTeacherId &&
                    !(c.subTeacherId === ds.originalTeacherId && c.originalTeacherId === ds.subTeacherId)
                );
                if (otherReplaced) {
                    isChainSubReplaced = true;
                    chainTeacherName = otherReplaced.subTeacher?.name || undefined;
                }

                // 2. Is the teacher I am replacing (B) also a substitute in another entry? (A -> B -> C)
                const otherReplacing = otherEntries.find((c: any) => 
                    c.subTeacherId === ds.originalTeacherId &&
                    !(c.subTeacherId === ds.originalTeacherId && c.originalTeacherId === ds.subTeacherId)
                );
                if (otherReplacing) {
                    isChainOriginalReplacing = true;
                    chainTeacherName = otherReplacing.originalTeacher?.name || undefined;
                }
            }

            if (isOriginal) {
                // 3. Am I (B) also a substitute in another entry? (A -> B -> C)
                const otherReplacing = otherEntries.find((c: any) => 
                    c.subTeacherId === teacherId &&
                    !(c.subTeacherId === ds.originalTeacherId && c.originalTeacherId === ds.subTeacherId)
                );
                if (otherReplacing) {
                    isChainOriginalReplacing = true;
                    chainTeacherName = otherReplacing.originalTeacher?.name || undefined;
                }
            }

            results.push({
                id: ds.id,
                date: new Date(ds.date),
                day: ds.day,
                hour: ds.hour,
                columnId: ds.columnId || `daily-${ds.id}`,
                eventTitle: ds.eventTitle || undefined,
                event: ds.event || undefined,
                school: ds.school,
                classes: getClasses(ds),
                subject: ds.subject || undefined,
                originalTeacher: ds.originalTeacher || undefined,
                columnType: ds.columnType || undefined,
                subTeacher: ds.subTeacher || undefined,
                position: ds.position || 0,
                instructions: ds.instructions || undefined,
                comment: ds.comment || undefined,
                isRegular: (isOriginal && !isReplaced && ds.columnType === 1 && !ds.event),
                isChainOriginalReplacing,
                isChainSubReplaced,
                chainTeacherName,
                createdAt: ds.createdAt,
                updatedAt: ds.updatedAt,
            });
        }
    });

    return results.sort((a: any, b: any) => a.hour - b.hour);
}

/**
 * Cached version of getTeacherScheduleService.
 * 
 * Uses unstable_cache with proper cache keys and school-level revalidation tag.
 * When a schedule is published for a school, calling revalidateTag(cacheTags.schoolSchedule(schoolId))
 * will invalidate ALL teacher caches for that school at once.
 * 
 * @param teacherId - The teacher ID
 * @param date - The date string (YYYY-MM-DD)
 * @param schoolId - The school ID (required for revalidation tag)
 * @returns Teacher's schedule for the specified date
 */
const teacherScheduleCache = new Map<string, any>();

export async function getCachedTeacherSchedule(
    teacherId: string,
    date: string,
    schoolId: string,
): Promise<DailyScheduleType[]> {
    const cacheKey = `${teacherId}-${date}-${schoolId}`;
    if (!teacherScheduleCache.has(cacheKey)) {
        teacherScheduleCache.set(cacheKey, unstable_cache(
            async () => getTeacherScheduleService(teacherId, date),
            ['getTeacherSchedule', teacherId, date],
            {
                tags: [
                    cacheTags.teacherSchedule(teacherId),
                    cacheTags.schoolSchedule(schoolId)
                ],
                revalidate: 86400, // 24 hours
            }
        ));
    }

    const cachedResults = await teacherScheduleCache.get(cacheKey)!();

    // IMPORTANT: unstable_cache serializes Date objects to strings
    // We need to convert them back to Date objects
    return cachedResults.map((schedule: any) => ({
        ...schedule,
        date: typeof schedule.date === 'string' ? new Date(schedule.date) : schedule.date,
        createdAt: typeof schedule.createdAt === 'string' ? new Date(schedule.createdAt) : schedule.createdAt,
        updatedAt: typeof schedule.updatedAt === 'string' ? new Date(schedule.updatedAt) : schedule.updatedAt,
    }));
}

