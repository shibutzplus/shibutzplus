"use server";

import { importAnnualService } from "@/services/importAnnual/importAnnualService";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db, schema } from "@/db";
import { eq, and, isNotNull } from "drizzle-orm";
import { dbLog } from "@/services/loggerService";

type EntityType = 'teachers' | 'classes' | 'subjects' | 'workGroups';

/**
 * Refresh a single entity type using Gemini AI.
 * Used when user wants to re-extract specific entities without re-running the full extraction.
 */
export const extractEntitiesFromFilesAction = async (
    formData: FormData,
    entityType: EntityType
) => {
    let schoolId: string | undefined;
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return { success: false, message: "Not authenticated" };
        }

        const providedSchoolId = formData.get("schoolId") as string | null;
        schoolId = providedSchoolId?.trim() || session.user.schoolId;

        if (!schoolId) {
            return { success: false, message: "No school ID available" };
        }

        const teacherFile = formData.get("teacherFile") as File;
        const classFile = formData.get("classFile") as File;

        if (!teacherFile || !classFile) {
            return { success: false, message: "Missing files" };
        }

        const fileToBuffer = async (file: File) => {
            const arrayBuffer = await file.arrayBuffer();
            return Buffer.from(arrayBuffer);
        };

        const teacherBuffer = await fileToBuffer(teacherFile);
        const classBuffer = await fileToBuffer(classFile);

        // Fetch dynamic keywords from DB (for all schools)
        let dynamicKeywords: string[] = [];

        if (entityType === 'workGroups') {
            try {
                const [globalSubjects, globalClasses] = await Promise.all([
                    db.query.subjects.findMany({
                        where: eq(schema.subjects.activity, true),
                        columns: { name: true }
                    }),
                    db.query.classes.findMany({
                        where: eq(schema.classes.activity, true),
                        columns: { name: true }
                    })
                ]);

                const uniqueNames = new Set([
                    ...globalSubjects.map(s => s.name.trim()),
                    ...globalClasses.map(c => c.name.trim())
                ]);
                dynamicKeywords = Array.from(uniqueNames).sort();
            } catch (err) {
                dbLog({
                    description: `Failed to fetch dynamic workGroup keywords: ${err instanceof Error ? err.message : String(err)}`,
                    schoolId
                });
            }
        } else if (entityType === 'subjects') {
            try {
                const globalSubjects = await db.query.subjects.findMany({
                    where: and(eq(schema.subjects.activity, false), isNotNull(schema.subjects.schoolId)),
                    columns: { name: true }
                });

                const uniqueNames = new Set(globalSubjects.map(s => s.name.trim()));
                dynamicKeywords = Array.from(uniqueNames).sort();
            } catch (err) {
                dbLog({
                    description: `Failed to fetch dynamic subject keywords: ${err instanceof Error ? err.message : String(err)}`,
                    schoolId
                });
            }
        }

        // Parse known entities (for cleaning)
        let knownTeachers: string[] = [];
        let knownClasses: string[] = [];
        try {
            const tStr = formData.get("knownTeachers") as string;
            const cStr = formData.get("knownClasses") as string;
            if (tStr) knownTeachers = JSON.parse(tStr);
            if (cStr) knownClasses = JSON.parse(cStr);
        } catch (e) {
            dbLog({
                description: `Failed to parse known entities for cleaning: ${e instanceof Error ? e.message : String(e)}`,
                schoolId,
                metadata: { entityType }
            });
        }

        // Extract single entity type
        const result = await importAnnualService.extractSingleEntity(
            teacherBuffer,
            classBuffer,
            entityType,
            dynamicKeywords,
            knownTeachers,
            knownClasses,
            schoolId
        );

        if (!result.success || !result.data) {
            return { success: false, message: result.message || "Extraction failed" };
        }

        return {
            success: true,
            data: result.data // Returns { name: string, source: 'ai' | 'manual' }[]
        };

    } catch (error) {
        dbLog({
            description: `Error in extractEntitiesFromFilesAction: ${error instanceof Error ? error.message : String(error)}`,
            schoolId,
            metadata: { entityType }
        });
        return {
            success: false,
            message: "Refresh failed"
        };
    }
};
