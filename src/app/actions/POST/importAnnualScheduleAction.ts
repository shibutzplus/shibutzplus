"use server";

//
//  Import Schedule from CSV
//
import { db, schema, executeQuery } from "@/db";
import { eq, and } from "drizzle-orm";
import { checkAuthAndParams, checkIsNotGuest } from "@/utils/authUtils";
import { TeacherRoleValues, TeacherRole } from "@/models/types/teachers";
import { parseCsvToBlocks, extractNameFromBlock, CsvAnalysisConfig } from "@/utils/importUtils";

type ImportResponse = {
    success: boolean;
    message: string;
    error?: any;
};

export async function importAnnualScheduleAction(
    schoolId: string,
    csvData: string[][],
    config: CsvAnalysisConfig,
    entityType: "teachers" | "classes" | "subjects" | "workGroups" = "teachers",
    manualEntityList?: string[]
): Promise<ImportResponse> {
    try {
        const authError = await checkAuthAndParams({ schoolId });
        if (authError) return authError as ImportResponse;

        const guestError = await checkIsNotGuest();
        if (guestError) {
            return guestError as ImportResponse;
        }

        if ((!csvData || csvData.length === 0) && (!manualEntityList || manualEntityList.length === 0)) {
            return { success: false, message: "נתונים ריקים" };
        }

        // --- Helper Functions ---

        const getOrCreateTeacher = async (name: string, role: string) => {
            // Cast string role to TeacherRole if safe, or use as is if DB accepts string
            // Find existing
            const existing = await db.select().from(schema.teachers).where(
                and(
                    eq(schema.teachers.schoolId, schoolId),
                    eq(schema.teachers.name, name)
                )
            ).limit(1);

            if (existing && existing.length > 0) return existing[0];

            // Create new
            const [newTeacher] = await db.insert(schema.teachers).values({
                schoolId,
                name,
                role: role as TeacherRole,
            }).returning();
            return newTeacher;
        };

        const getOrCreateClass = async (name: string, isActivity: boolean = false) => {
            // Find existing
            const existing = await db.select().from(schema.classes).where(
                and(
                    eq(schema.classes.schoolId, schoolId),
                    eq(schema.classes.name, name)
                )
            ).limit(1);

            if (existing && existing.length > 0) return existing[0];

            // Create new
            const [newClass] = await db.insert(schema.classes).values({
                schoolId,
                name,
                activity: isActivity,
            }).returning();
            return newClass;
        };

        const getOrCreateSubject = async (name: string, isActivity: boolean = false) => {
            // Find existing
            const existing = await db.select().from(schema.subjects).where(
                and(
                    eq(schema.subjects.schoolId, schoolId),
                    eq(schema.subjects.name, name)
                )
            ).limit(1);

            if (existing && existing.length > 0) return existing[0];

            // Create new
            const [newSubject] = await db.insert(schema.subjects).values({
                schoolId,
                name,
                activity: isActivity,
            }).returning();
            return newSubject;
        };


        // --- Parsing Logic ---

        await executeQuery(async () => {
            // 1. Manual List Override
            if (manualEntityList && manualEntityList.length > 0) {
                for (const name of manualEntityList) {
                    if (entityType === "teachers") {
                        await getOrCreateTeacher(name, TeacherRoleValues.REGULAR);
                    } else if (entityType === "classes") {
                        await getOrCreateClass(name);
                    } else if (entityType === "subjects") {
                        await getOrCreateSubject(name);
                    } else if (entityType === "workGroups") {
                        // Work Groups are saved as BOTH Class and Subject with activity=true
                        await getOrCreateClass(name, true);
                        await getOrCreateSubject(name, true);
                    }
                }
                return; // SKIP CSV PARSING
            }

            // 2. CSV Parsing
            const blocks = parseCsvToBlocks(csvData, config);

            if (entityType === "subjects") {
                // Special handling for subjects: Extract from GRID
                const { extractSubjectsFromGrid } = await import("@/utils/importUtils");
                const result = extractSubjectsFromGrid(blocks, config);
                for (const subjectName of result.subjects) {
                    await getOrCreateSubject(subjectName);
                }
            } else {
                // Standard handling for Teachers / Classes: Extract from HEADER
                for (const block of blocks) {
                    // Validate block size
                    if (block.length < config.dataStartRow) continue;

                    const entityName = extractNameFromBlock(block, config);
                    if (!entityName) continue;

                    if (entityType === "teachers") {
                        await getOrCreateTeacher(entityName, TeacherRoleValues.REGULAR);
                    } else if (entityType === "classes") {
                        await getOrCreateClass(entityName);
                    }
                }
            }
        });

        let successMessage = "הייבוא בוצע בהצלחה";
        if (entityType === "teachers") successMessage = "ייבוא מורים בוצע בהצלחה";
        else if (entityType === "classes") successMessage = "ייבוא כיתות בוצע בהצלחה";
        else if (entityType === "subjects") successMessage = "ייבוא מקצועות בוצע בהצלחה";
        else if (entityType === "workGroups") successMessage = "קבוצות עבודה נשמרו בהצלחה";

        return { success: true, message: successMessage };

    } catch (error: any) {
        console.error("Import error:", error);
        return { success: false, message: "שגיאה בייבוא הנתונים", error: error.message };
    }
}
