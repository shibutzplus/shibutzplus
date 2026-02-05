"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { teachers, classes, subjects, annualSchedule, type NewAnnualScheduleSchema } from "@/db/schema";
import { eq, and, notInArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { dbLog } from "@/services/loggerService";
import { pushSyncUpdateServer } from "@/services/sync/serverSyncService";
import { ENTITIES_DATA_CHANGED } from "@/models/constant/sync";

/**
 * Step 2-5: Per-entity list - Add a single entity item to DB
 */
export const addSingleEntityAction = async (
    schoolId: string | undefined,
    entityType: 'teachers' | 'classes' | 'subjects' | 'workGroups',
    itemName: string
) => {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return { success: false, message: "Not authenticated" };

        const targetSchoolId = schoolId || session.user.schoolId;
        if (!targetSchoolId) return { success: false, message: "No school ID available" };

        const name = itemName.trim();
        if (!name) return { success: false, message: "Item name is empty" };

        const checkExists = async (table: any, additionalConditions: any[] = []) => {
            const result = await db.select({ id: table.id })
                .from(table)
                .where(and(
                    eq(table.schoolId, targetSchoolId),
                    eq(table.name, name),
                    ...additionalConditions
                ))
                .limit(1);
            return result.length > 0;
        };

        if (entityType === 'teachers') {
            const exists = await checkExists(teachers, [eq(teachers.role, 'regular')]);
            if (exists) return { success: true, message: "Teacher already exists", alreadyExists: true };

            await db.insert(teachers).values({
                name,
                schoolId: targetSchoolId,
                role: 'regular'
            });

        } else if (entityType === 'classes') {
            const exists = await checkExists(classes, [eq(classes.activity, false)]);
            if (exists) return { success: true, message: "Class already exists", alreadyExists: true };

            await db.insert(classes).values({
                name,
                schoolId: targetSchoolId,
                activity: false
            });

        } else if (entityType === 'subjects') {
            const exists = await checkExists(subjects, [eq(subjects.activity, false)]);
            if (exists) return { success: true, message: "Subject already exists", alreadyExists: true };

            await db.insert(subjects).values({
                name,
                schoolId: targetSchoolId,
                activity: false
            });

        } else if (entityType === 'workGroups') {
            // WorkGroups must be added to BOTH 'classes' and 'subjects' with activity=true
            const classExists = await checkExists(classes, [eq(classes.activity, true)]);
            if (!classExists) {
                await db.insert(classes).values({
                    name,
                    schoolId: targetSchoolId,
                    activity: true
                });
            }

            const subjectExists = await checkExists(subjects, [eq(subjects.activity, true)]);
            if (!subjectExists) {
                await db.insert(subjects).values({
                    name,
                    schoolId: targetSchoolId,
                    activity: true
                });
            }

            if (classExists && subjectExists) {
                return { success: true, message: "WorkGroup already exists", alreadyExists: true };
            }
        } else {
            return { success: false, message: "Invalid entity type" };
        }

        revalidatePath('/annual-import');
        void pushSyncUpdateServer(ENTITIES_DATA_CHANGED, { schoolId: targetSchoolId });
        return { success: true, message: "Item added successfully" };
    } catch (error: any) {
        dbLog({
            description: `Error in addSingleEntityAction: ${error instanceof Error ? error.message : String(error)}`,
            schoolId,
            metadata: { entityType, itemName }
        });
        return { success: false, message: `Add failed: ${error.message}` };
    }
};

/**
 * Step 2-5: Per-entity list sync (syncs list and deletes missing)
 *           Uses bulk operations to minimize DB queries
 */
export const syncAllEntityValuesAction = async (
    schoolId: string | undefined,
    entityType: 'teachers' | 'classes' | 'subjects' | 'workGroups',
    items: string[]
) => {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return { success: false, message: "Not authenticated" };

        const targetSchoolId = schoolId || session.user.schoolId;
        if (!targetSchoolId) return { success: false, message: "No school ID available" };

        const normalize = (s: string) => s.trim();
        const validItems = items.map(normalize).filter(Boolean);

        const syncTable = async (
            tableObj: any,
            extraInsertFields: Record<string, any> = {},
            matchConditions: any[] = []
        ) => {
            // 1. Load all existing items for this school (ONE query using Standard Select)
            const existingItems = await db.select()
                .from(tableObj)
                .where(and(eq(tableObj.schoolId, targetSchoolId), ...matchConditions));

            const existingMap = new Map(existingItems.map((item: any) => [item.name, item]));
            const existingNames = new Set(existingItems.map((item: any) => item.name));

            // 2. Determine what to insert, update, and delete
            const toInsert: any[] = [];
            const toUpdate: any[] = [];

            for (const name of validItems) {
                if (!existingNames.has(name)) {
                    // New item - prepare for bulk insert
                    toInsert.push({ name, schoolId: targetSchoolId, ...extraInsertFields });
                } else if (Object.keys(extraInsertFields).length > 0) {
                    // Existing item - check if needs update
                    const existing = existingMap.get(name) as any;

                    // Optimization: Only update if fields actually differ
                    const needsUpdate = Object.entries(extraInsertFields).some(([key, val]) => existing[key] !== val);

                    if (needsUpdate) {
                        toUpdate.push({ id: existing.id, ...extraInsertFields });
                    }
                }
            }

            // 3. Bulk INSERT
            if (toInsert.length > 0) {
                await db.insert(tableObj).values(toInsert);
            }

            // 4. Bulk UPDATE
            if (toUpdate.length > 0) {
                for (const update of toUpdate) {
                    const { id, ...fields } = update;
                    await db.update(tableObj).set(fields).where(eq(tableObj.id, id));
                }
            }

            // 5. DELETE items not in the new list
            if (validItems.length > 0) {
                await db.delete(tableObj).where(
                    and(
                        eq(tableObj.schoolId, targetSchoolId),
                        ...matchConditions,
                        notInArray(tableObj.name, validItems)
                    )
                );
            } else {
                // If no valid items, delete all for this school with match conditions
                await db.delete(tableObj).where(and(eq(tableObj.schoolId, targetSchoolId), ...matchConditions));
            }
        };

        if (entityType === 'teachers') await syncTable(teachers, { role: 'regular' });
        else if (entityType === 'classes') await syncTable(classes, { activity: false }, [eq(classes.activity, false)]);
        else if (entityType === 'subjects') await syncTable(subjects, { activity: false }, [eq(subjects.activity, false)]);
        else if (entityType === 'workGroups') {
            await syncTable(classes, { activity: true }, [eq(classes.activity, true)]);
            await syncTable(subjects, { activity: true }, [eq(subjects.activity, true)]);
        }

        void pushSyncUpdateServer(ENTITIES_DATA_CHANGED, { schoolId: targetSchoolId });
        return { success: true, message: "Database updated successfully" };
    } catch (error: any) {
        dbLog({
            description: `Error in syncAllEntityValuesAction: ${error instanceof Error ? error.message : String(error)}`,
            schoolId,
            metadata: { entityType }
        });
        return { success: false, message: `Update failed: ${error.message}` };
    }
};


/**
 * Step 6: Save individual teacher schedule
 */
export async function saveTeacherScheduleAction(
    teacherName: string,
    schoolId: string,
    scheduleItems: { day: number, hour: number, className: string, subjectName: string }[]
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return { success: false, message: "Not authenticated" };

        const targetSchoolId = schoolId || session.user.schoolId;
        if (!targetSchoolId) return { success: false, message: "No school ID available" };

        // 1. Resolve Teacher ID
        const teacher = await db.query.teachers.findFirst({
            where: and(
                eq(teachers.schoolId, targetSchoolId),
                eq(teachers.name, teacherName)
            )
        });

        if (!teacher) {
            return { success: false, message: `המורה '${teacherName}' לא נמצא במערכת. יש לשמור את המורה ברשימת המורים קודם.` };
        }

        // 2. (Moved below validation) Clear existing annual schedule logic will happen only if valid


        // 3. Process items in bulk-ish way (resolve IDs then insert)
        // we'll fetch map of all classes and subjects for the school.
        const allClassList = await db.query.classes.findMany({
            where: eq(classes.schoolId, targetSchoolId)
        });
        const classMap = new Map(allClassList.map(c => [c.name, c.id]));

        const allSubjectList = await db.query.subjects.findMany({
            where: eq(subjects.schoolId, targetSchoolId)
        });
        const subjectMap = new Map(allSubjectList.map(s => [s.name, s.id]));

        const toInsert: NewAnnualScheduleSchema[] = [];
        const missingClasses: string[] = [];
        const missingSubjects: string[] = [];

        for (const item of scheduleItems) {
            // Skip empty cells (no subject and no class)
            if (item.className === "ללא כיתה" && item.subjectName === "ללא מקצוע") {
                continue; // This is an empty cell, skip it
            }

            // For work groups, className is "קבוצה" (placeholder)
            // The actual work group name is in subjectName
            // Work groups have BOTH class and subject entries with the same name and activity=true
            const isWorkGroup = item.className === "קבוצה";

            // For work groups: look up class by subject name (the work group name)
            // For regular classes: look up class by class name
            const classLookupName = isWorkGroup ? item.subjectName : item.className;
            const classId = classMap.get(classLookupName);
            const subjectId = subjectMap.get(item.subjectName);

            // Validate class (only if not "ללא כיתה")
            if (!classId && item.className !== "ללא כיתה") {
                const missingName = isWorkGroup ? item.subjectName : item.className;
                if (!missingClasses.includes(missingName)) missingClasses.push(missingName);
            }

            // Validate subject/work group (only if not "ללא מקצוע")
            if (!subjectId && item.subjectName !== "ללא מקצוע") {
                if (!missingSubjects.includes(item.subjectName)) missingSubjects.push(item.subjectName);
            }

            if (classId && subjectId) {
                toInsert.push({
                    schoolId: targetSchoolId,
                    teacherId: teacher.id,
                    day: item.day,
                    hour: item.hour,
                    classId: classId,
                    subjectId: subjectId,
                });
            }
        }

        // Strict Mode: If any missing, abort!
        if (missingClasses.length > 0 || missingSubjects.length > 0) {
            let errorMsg = "לא ניתן לשמור את המערכת כי חסרים נתונים במאגר:\n";
            if (missingClasses.length > 0) errorMsg += `כיתות חסרות: ${missingClasses.join(", ")}\n`;
            if (missingSubjects.length > 0) errorMsg += `מקצועות חסרים: ${missingSubjects.join(", ")}\n`;
            errorMsg += "יש לשמור את הפריטים הללו בשלבים הקודמים לפני שמירת המערכת.";

            return { success: false, message: errorMsg };
        }

        // If we got here, everything is valid. Proceed to save.

        // 2. Clear existing annual schedule for this teacher
        // (Moved here to avoid deleting if validation fails)
        await db.delete(annualSchedule)
            .where(and(
                eq(annualSchedule.schoolId, targetSchoolId),
                eq(annualSchedule.teacherId, teacher.id)
            ));

        if (toInsert.length > 0) {
            await db.insert(annualSchedule).values(toInsert);
        }

        revalidatePath('/annual-import');
        revalidatePath('/annual-teacher');
        revalidatePath('/annual-class');
        revalidatePath('/annual-view');

        return { success: true, message: `המערכת נשמרה בהצלחה!` };

    } catch (error: any) {
        dbLog({
            description: `Error in saveTeacherScheduleAction: ${error instanceof Error ? error.message : String(error)}`,
            schoolId,
            metadata: { teacherName }
        });
        return { success: false, message: `Error: ${error.message}` };
    }
}
