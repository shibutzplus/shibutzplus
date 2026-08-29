import { db, schema, executeQuery } from "@/db";
import { eq, and, asc } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { cacheTags } from "@/lib/cacheTags";
import { TeacherType, TeacherRoleValues } from "@/models/types/teachers";
import { SubjectType } from "@/models/types/subjects";
import { ClassType } from "@/models/types/classes";
import { PortalType, PortalTypeVal } from "@/models/types";

/**
 * Cached service to fetch teachers list.
 * Used by public pages (school-changes-full, school-changes, teacher-changes).
 * 
 * @param schoolId - The school ID
 * @param options - Filter options
 * @returns Array of teachers
 */
const teachersCache = new Map<string, any>();

async function fetchFreshTeachersList(
    schoolId: string,
    options?: { portalType?: PortalTypeVal; includeSubstitutes?: boolean }
): Promise<TeacherType[]> {
    return await executeQuery(async () => {
        const conditions = [
            eq(schema.teachers.schoolId, schoolId),
            eq(schema.teachers.isActive, true)
        ];

        if (options?.portalType === PortalType.Teacher && options?.includeSubstitutes === false) {
            conditions.push(eq(schema.teachers.role, TeacherRoleValues.REGULAR));
        }

        const teachers = await db
            .select()
            .from(schema.teachers)
            .where(and(...conditions))
            .orderBy(asc(schema.teachers.name));

        return teachers as TeacherType[];
    });
}

export async function getCachedTeachersList(
    schoolId: string,
    options?: { portalType?: PortalTypeVal; includeSubstitutes?: boolean }
): Promise<TeacherType[]> {
    if (process.env.NODE_ENV === "development") {
        return fetchFreshTeachersList(schoolId, options);
    }

    const cacheKey = `${schoolId}-${JSON.stringify(options || {})}`;
    if (!teachersCache.has(cacheKey)) {
        teachersCache.set(cacheKey, unstable_cache(
            async () => fetchFreshTeachersList(schoolId, options),
            ['getTeachersList', schoolId, JSON.stringify(options || {})],
            {
                tags: [cacheTags.teachersList(schoolId)],
                revalidate: 604800, // 7 days
            }
        ));
    }

    return teachersCache.get(cacheKey)!();
}

const subjectsCache = new Map<string, any>();

async function fetchFreshSubjectsList(
    schoolId: string,
    _options?: { portalType?: PortalTypeVal }
): Promise<SubjectType[]> {
    return await executeQuery(async () => {
        const subjects = await db
            .select()
            .from(schema.subjects)
            .where(eq(schema.subjects.schoolId, schoolId))
            .orderBy(asc(schema.subjects.name));

        return subjects as SubjectType[];
    });
}

export async function getCachedSubjectsList(
    schoolId: string,
    options?: { portalType?: PortalTypeVal }
): Promise<SubjectType[]> {
    if (process.env.NODE_ENV === "development") {
        return fetchFreshSubjectsList(schoolId, options);
    }

    const cacheKey = `${schoolId}-${JSON.stringify(options || {})}`;
    if (!subjectsCache.has(cacheKey)) {
        subjectsCache.set(cacheKey, unstable_cache(
            async () => fetchFreshSubjectsList(schoolId, options),
            ['getSubjectsList', schoolId, JSON.stringify(options || {})],
            {
                tags: [cacheTags.subjectsList(schoolId)],
                revalidate: 604800, // 7 days
            }
        ));
    }

    return subjectsCache.get(cacheKey)!();
}

const classesCache = new Map<string, any>();

async function fetchFreshClassesList(
    schoolId: string,
    _options?: { portalType?: PortalTypeVal }
): Promise<ClassType[]> {
    return await executeQuery(async () => {
        const classes = await db
            .select()
            .from(schema.classes)
            .where(and(eq(schema.classes.schoolId, schoolId), eq(schema.classes.isActive, true)))
            .orderBy(asc(schema.classes.activity), asc(schema.classes.name));

        return classes as ClassType[];
    });
}

export async function getCachedClassesList(
    schoolId: string,
    options?: { portalType?: PortalTypeVal }
): Promise<ClassType[]> {
    if (process.env.NODE_ENV === "development") {
        return fetchFreshClassesList(schoolId, options);
    }

    const cacheKey = `${schoolId}-${JSON.stringify(options || {})}`;
    if (!classesCache.has(cacheKey)) {
        classesCache.set(cacheKey, unstable_cache(
            async () => fetchFreshClassesList(schoolId, options),
            ['getClassesList', schoolId, JSON.stringify(options || {})],
            {
                tags: [cacheTags.classesList(schoolId)],
                revalidate: 604800, // 7 days
            }
        ));
    }

    return classesCache.get(cacheKey)!();
}

const schoolCache = new Map<string, any>();

export const getCachedSchool = async (schoolId: string) => {
    if (process.env.NODE_ENV === "development") {
        return getFreshSchool(schoolId);
    }

    if (!schoolCache.has(schoolId)) {
        schoolCache.set(schoolId, unstable_cache(
            async () => {
                return db
                    .select()
                    .from(schema.schools)
                    .where(eq(schema.schools.id, schoolId))
                    .then((res) => res[0]);
            },
            ['getSchool', schoolId], // Key parts
            {
                tags: [cacheTags.school(schoolId)],
                revalidate: 3600, // 1 hour
            }
        ));
    }

    return schoolCache.get(schoolId)!();
};

/**
 * Fetches a school by ID directly from the DB, bypassing cache.
 * Use this when you need absolutely fresh data (e.g. for Admin/Manager actions).
 */
export const getFreshSchool = async (schoolId: string) => {
    return db
        .select()
        .from(schema.schools)
        .where(eq(schema.schools.id, schoolId))
        .then((res) => res[0]);
};

