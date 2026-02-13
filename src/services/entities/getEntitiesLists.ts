import { db, schema, executeQuery } from "@/db";
import { eq, and } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { cacheTags } from "@/lib/cacheTags";
import { TeacherType } from "@/models/types/teachers";
import { SubjectType } from "@/models/types/subjects";
import { ClassType } from "@/models/types/classes";

/**
 * Cached service to fetch teachers list.
 * Used by public pages (schedule-full, schedule-view, teacher-material).
 * 
 * @param schoolId - The school ID
 * @param options - Filter options
 * @returns Array of teachers
 */
export async function getCachedTeachersList(
    schoolId: string,
    options?: { isPrivate?: boolean; hasSub?: boolean }
): Promise<TeacherType[]> {
    const cachedFn = unstable_cache(
        async () => {
            return await executeQuery(async () => {
                const conditions = [eq(schema.teachers.schoolId, schoolId)];

                if (options?.isPrivate === false) {
                    conditions.push(eq(schema.teachers.role, "regular"));
                }

                const teachers = await db
                    .select()
                    .from(schema.teachers)
                    .where(and(...conditions))
                    .orderBy(schema.teachers.name);

                return teachers as TeacherType[];
            });
        },
        ['getTeachersList', schoolId, JSON.stringify(options || {})],
        {
            tags: [cacheTags.teachersList(schoolId)],
            revalidate: 7200,
        }
    );

    return cachedFn();
}

/**
 * Cached service to fetch subjects list.
 * 
 * @param schoolId - The school ID
 * @param options - Filter options
 * @returns Array of subjects
 */
export async function getCachedSubjectsList(
    schoolId: string,
    options?: { isPrivate?: boolean }
): Promise<SubjectType[]> {
    const cachedFn = unstable_cache(
        async () => {
            return await executeQuery(async () => {
                const subjects = await db
                    .select()
                    .from(schema.subjects)
                    .where(eq(schema.subjects.schoolId, schoolId))
                    .orderBy(schema.subjects.name);

                return subjects as SubjectType[];
            });
        },
        ['getSubjectsList', schoolId, JSON.stringify(options || {})],
        {
            tags: [cacheTags.subjectsList(schoolId)],
            revalidate: 7200,
        }
    );

    return cachedFn();
}

/**
 * Cached service to fetch classes list.
 * 
 * @param schoolId - The school ID
 * @param options - Filter options
 * @returns Array of classes
 */
export async function getCachedClassesList(
    schoolId: string,
    options?: { isPrivate?: boolean }
): Promise<ClassType[]> {
    const cachedFn = unstable_cache(
        async () => {
            return await executeQuery(async () => {
                const classes = await db
                    .select()
                    .from(schema.classes)
                    .where(eq(schema.classes.schoolId, schoolId))
                    .orderBy(schema.classes.activity, schema.classes.name);

                return classes as ClassType[];
            });
        },
        ['getClassesList', schoolId, JSON.stringify(options || {})],
        {
            tags: [cacheTags.classesList(schoolId)],
            revalidate: 7200,
        }
    );

    return cachedFn();
}
