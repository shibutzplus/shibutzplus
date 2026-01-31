"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { dbLog } from "@/services/loggerService";

const fetchSchoolEntities = async (schoolId: string) => {
    const [dbTeachers, dbClasses, dbSubjects] = await Promise.all([
        db.query.teachers.findMany({
            where: eq(schema.teachers.schoolId, schoolId),
            columns: { name: true }
        }),
        db.query.classes.findMany({
            where: eq(schema.classes.schoolId, schoolId),
            columns: { name: true, activity: true }
        }),
        db.query.subjects.findMany({
            where: eq(schema.subjects.schoolId, schoolId),
            columns: { name: true, activity: true }
        })
    ]);

    const normalize = (s: string) => s.trim();

    const existingTeacherNames = new Set(dbTeachers.map(t => normalize(t.name)));
    const existingClassNames = new Set(dbClasses.filter(c => !c.activity).map(c => normalize(c.name)));
    const existingSubjectNames = new Set(dbSubjects.filter(s => !s.activity).map(s => normalize(s.name)));

    // WorkGroups: check classes(activity=true) OR subjects(activity=true)
    const existingWorkGroupNames = new Set([
        ...dbClasses.filter(c => c.activity).map(c => normalize(c.name)),
        ...dbSubjects.filter(s => s.activity).map(s => normalize(s.name))
    ]);

    return {
        existingTeacherNames,
        existingClassNames,
        existingSubjectNames,
        existingWorkGroupNames,
        raw: {
            teachers: dbTeachers,
            classes: dbClasses,
            subjects: dbSubjects
        }
    };
};

/**
 * Fetch existing entities from DB
 */
export const loadEntitiesFromDBAction = async (formData: FormData) => {
    let schoolId = "";
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return { success: false, message: "Not authenticated" };
        }

        const providedSchoolId = formData.get("schoolId") as string | null;
        schoolId = providedSchoolId?.trim() || session.user.schoolId || "";

        if (!schoolId) {
            return { success: false, message: "No school ID available" };
        }

        // Fetch from DB
        const {
            existingTeacherNames,
            existingClassNames,
            existingSubjectNames,
            existingWorkGroupNames
        } = await fetchSchoolEntities(schoolId);

        // The page expects { name, exists } structure for EditableList
        // Since we are fetching ONLY existing, all are exists=true

        const mapToStatus = (set: Set<string>) => {
            return Array.from(set).sort().map(name => ({
                name,
                exists: true
            }));
        };

        const enrichedData = {
            teachers: mapToStatus(existingTeacherNames),
            classes: mapToStatus(existingClassNames),
            subjects: mapToStatus(existingSubjectNames),
            workGroups: mapToStatus(existingWorkGroupNames),
            schedule: [] // No schedule when just loading entities
        };

        return {
            success: true,
            data: enrichedData,
            message: "Loaded existing data from database"
        };

    } catch (error: any) {
        dbLog({ description: `Error in loadEntitiesFromDBAction: ${error instanceof Error ? error.message : String(error)}`, schoolId });
        return {
            success: false,
            message: `Error loading existing data: ${error.message}`
        };
    }
};
