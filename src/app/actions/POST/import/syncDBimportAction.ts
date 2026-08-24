"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { teachers, classes, subjects, annualSchedule, annualScheduleAlt, type NewAnnualScheduleSchema } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { cacheTags } from "@/lib/cacheTags";
import { dbLog } from "@/services/loggerService";
import { pushSyncUpdateServer } from "@/services/sync/serverSyncService";
import { ENTITIES_DATA_CHANGED } from "@/models/constant/sync";
import { normalizeClassCode } from "@/services/importAnnual/docxUtils";
import { clearAnnualScheduleCache } from "@/services/schedule/getAnnualSchedule";

/**
 * Step 2-5: Per-entity list - Add a single entity item to DB
 */
export const addSingleEntityAction = async (
    schoolId: string | undefined,
    entityType: 'teachers' | 'classes' | 'subjects' | 'workGroups',
    itemName: string
) => {
    try {
        const session = await auth();
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
            // Check for existing subject by name regardless of activity flag
            // (a subject might already exist as a workGroup with activity=true)
            const exists = await checkExists(subjects);
            if (exists) return { success: true, message: "Subject already exists", alreadyExists: true };

            await db.insert(subjects).values({
                name,
                schoolId: targetSchoolId,
                activity: false
            }).onConflictDoNothing();

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

        if (entityType === 'teachers') {
            revalidateTag(cacheTags.teachersList(targetSchoolId));
        } else if (entityType === 'classes') {
            revalidateTag(cacheTags.classesList(targetSchoolId));
        } else if (entityType === 'subjects') {
            revalidateTag(cacheTags.subjectsList(targetSchoolId));
        } else if (entityType === 'workGroups') {
            revalidateTag(cacheTags.classesList(targetSchoolId));
            revalidateTag(cacheTags.subjectsList(targetSchoolId));
        }
        revalidateTag(cacheTags.schoolSchedule(targetSchoolId));

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
        const session = await auth();
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

            // 2. Determine what to insert, update (isActive=true), deactivate (isActive=false), or delete (for subjects)
            const toInsert: any[] = [];
            const toUpdateActive: any[] = [];
            const toDeactivate: any[] = [];
            const toDelete: string[] = [];

            for (const name of validItems) {
                if (!existingNames.has(name)) {
                    // New item - prepare for bulk insert
                    toInsert.push({
                        name,
                        schoolId: targetSchoolId,
                        ...(tableObj !== subjects ? { isActive: true } : {}),
                        ...extraInsertFields,
                    });
                } else {
                    const existing = existingMap.get(name) as any;
                    // Existing item - ensure active and extra fields match
                    const needsUpdate = (tableObj !== subjects && !existing.isActive) ||
                        Object.entries(extraInsertFields).some(([key, val]) => existing[key] !== val);

                    if (needsUpdate) {
                        toUpdateActive.push({
                            id: existing.id,
                            ...(tableObj !== subjects ? { isActive: true } : {}),
                            ...extraInsertFields,
                        });
                    }
                }
            }

            // Find items that exist in DB but are not in the new validItems list
            for (const [name, existing] of existingMap.entries()) {
                // If entity is teachers, do NOT deactivate substitutes or staff (only deactivate regular teachers not in new list)
                if (tableObj === teachers && (existing.role === 'substitute' || existing.role === 'staff')) {
                    continue;
                }

                if (!validItems.includes(name)) {
                    if (tableObj === subjects) {
                        toDelete.push(existing.id);
                    } else if (existing.isActive) {
                        toDeactivate.push(existing.id);
                    }
                }
            }

            // 3. Bulk INSERT (onConflictDoNothing handles cases where the same name exists
            //    with a different activity value, e.g. a workGroup that is also a subject)
            if (toInsert.length > 0) {
                await db.insert(tableObj).values(toInsert).onConflictDoNothing();
            }

            // 4. Bulk UPDATE to active
            if (toUpdateActive.length > 0) {
                for (const update of toUpdateActive) {
                    const { id, ...fields } = update;
                    await db.update(tableObj).set(fields).where(eq(tableObj.id, id));
                }
            }

            // 5. DEACTIVATE items not in the new list (for teachers/classes with isActive)
            if (toDeactivate.length > 0) {
                await db.update(tableObj).set({ isActive: false }).where(inArray(tableObj.id, toDeactivate));
            }

            // 6. DELETE items not in the new list (for subjects)
            if (toDelete.length > 0) {
                await db.delete(tableObj).where(inArray(tableObj.id, toDelete));
            }
        };

        if (entityType === 'teachers') {
            // Load ALL teachers for this school without filtering by role, so substitutes in file get upgraded to regular
            await syncTable(teachers, { role: 'regular' }, []);
            revalidateTag(cacheTags.teachersList(targetSchoolId));
        } else if (entityType === 'classes') {
            await syncTable(classes, { activity: false }, [eq(classes.activity, false)]);
            revalidateTag(cacheTags.classesList(targetSchoolId));
        } else if (entityType === 'subjects') {
            await syncTable(subjects, { activity: false }, [eq(subjects.activity, false)]);
            revalidateTag(cacheTags.subjectsList(targetSchoolId));
        } else if (entityType === 'workGroups') {
            await syncTable(classes, { activity: true }, [eq(classes.activity, true)]);
            await syncTable(subjects, { activity: true }, [eq(subjects.activity, true)]);
            revalidateTag(cacheTags.classesList(targetSchoolId));
            revalidateTag(cacheTags.subjectsList(targetSchoolId));
        }
        revalidateTag(cacheTags.schoolSchedule(targetSchoolId));

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
        const session = await auth();
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
        const classCodeMap = new Map(allClassList.map(c => [normalizeClassCode(c.name), c.id]));

        const allSubjectList = await db.query.subjects.findMany({
            where: eq(subjects.schoolId, targetSchoolId)
        });
        const subjectMap = new Map(allSubjectList.map(s => [s.name, s.id]));

        const toInsert: NewAnnualScheduleSchema[] = [];

        for (const item of scheduleItems) {
            // Skip empty cells (no subject and no class)
            if (item.className === "ללא כיתה" && item.subjectName === "ללא מקצוע") {
                continue; // This is an empty cell, skip it
            }

            const isWorkGroup = item.className === "קבוצה";

            if (isWorkGroup) {
                let classId = classMap.get(item.subjectName);
                let subjectId = subjectMap.get(item.subjectName);

                if (!classId) {
                    const [inserted] = await db.insert(classes).values({
                        name: item.subjectName,
                        schoolId: targetSchoolId,
                        activity: true
                    }).returning({ id: classes.id });
                    if (inserted) {
                        classId = inserted.id;
                        classMap.set(item.subjectName, classId);
                    }
                }
                if (!subjectId && item.subjectName !== "ללא מקצוע") {
                    const [inserted] = await db.insert(subjects).values({
                        name: item.subjectName,
                        schoolId: targetSchoolId,
                        activity: true
                    }).returning({ id: subjects.id });
                    if (inserted) {
                        subjectId = inserted.id;
                        subjectMap.set(item.subjectName, subjectId);
                    }
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
            } else {
                // Support multiple classes (e.g. "כיתה ג1, כיתה ג2, כיתה ג3")
                const classNames = item.className.split(",").map(c => c.trim()).filter(Boolean);
                let subjectId = subjectMap.get(item.subjectName);

                if (!subjectId && item.subjectName && item.subjectName !== "ללא מקצוע") {
                    const [inserted] = await db.insert(subjects).values({
                        name: item.subjectName,
                        schoolId: targetSchoolId,
                        activity: false
                    }).returning({ id: subjects.id });
                    if (inserted) {
                        subjectId = inserted.id;
                        subjectMap.set(item.subjectName, subjectId);
                    }
                }

                for (const singleClassName of classNames) {
                    let classId = classMap.get(singleClassName);
                    if (!classId && singleClassName !== "ללא כיתה") {
                        const code = normalizeClassCode(singleClassName);
                        if (code) {
                            classId = classCodeMap.get(code);
                        }
                    }

                    if (!classId && singleClassName !== "ללא כיתה") {
                        const [inserted] = await db.insert(classes).values({
                            name: singleClassName,
                            schoolId: targetSchoolId,
                            activity: false
                        }).returning({ id: classes.id });
                        if (inserted) {
                            classId = inserted.id;
                            classMap.set(singleClassName, classId);
                        }
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
            }
        }

        // 2. Clear existing annual schedule for this teacher
        await db.delete(annualSchedule)
            .where(and(
                eq(annualSchedule.schoolId, targetSchoolId),
                eq(annualSchedule.teacherId, teacher.id)
            ));

        if (toInsert.length > 0) {
            await db.insert(annualSchedule).values(toInsert);
        }

        revalidatePath('/annual-import');
        revalidatePath('/annual-build-teacher');
        revalidatePath('/annual-build-class');
        revalidatePath('/annual-view');

        // Invalidate annual schedule cache
        clearAnnualScheduleCache(targetSchoolId);
        revalidateTag(cacheTags.schoolSchedule(targetSchoolId));
        void pushSyncUpdateServer(ENTITIES_DATA_CHANGED, { schoolId: targetSchoolId });

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

/**
 * Step 6: Save schedules for ALL teachers at once
 */
export async function saveAllTeachersSchedulesAction(
    schoolId: string,
    schedules: {
        teacherName: string;
        scheduleItems: { day: number; hour: number; className: string; subjectName: string }[];
    }[]
) {
    try {
        const session = await auth();
        if (!session?.user) return { success: false, message: "Not authenticated" };

        const targetSchoolId = schoolId || session.user.schoolId;
        if (!targetSchoolId) return { success: false, message: "No school ID available" };

        // 1. Fetch maps of teachers, classes, and subjects for the school
        const allTeacherList = await db.query.teachers.findMany({
            where: and(eq(teachers.schoolId, targetSchoolId), eq(teachers.role, 'regular'))
        });
        const teacherMap = new Map(allTeacherList.map(t => [t.name, t.id]));

        const allClassList = await db.query.classes.findMany({
            where: eq(classes.schoolId, targetSchoolId)
        });
        const classMap = new Map(allClassList.map(c => [c.name, c.id]));
        const classCodeMap = new Map(allClassList.map(c => [normalizeClassCode(c.name), c.id]));

        const allSubjectList = await db.query.subjects.findMany({
            where: eq(subjects.schoolId, targetSchoolId)
        });
        const subjectMap = new Map(allSubjectList.map(s => [s.name, s.id]));

        // 2. Pre-create any missing subjects, classes, and workGroups
        const neededWorkGroups = new Set<string>();
        const neededSubjects = new Set<string>();
        const neededClasses = new Set<string>();

        for (const sched of schedules) {
            for (const item of sched.scheduleItems) {
                if (item.className === "ללא כיתה" && item.subjectName === "ללא מקצוע") continue;
                if (item.className === "קבוצה") {
                    if (item.subjectName && item.subjectName !== "ללא מקצוע") {
                        neededWorkGroups.add(item.subjectName);
                    }
                } else {
                    if (item.subjectName && item.subjectName !== "ללא מקצוע") {
                        neededSubjects.add(item.subjectName);
                    }
                    const classNames = item.className.split(",").map(c => c.trim()).filter(Boolean);
                    classNames.forEach(c => {
                        if (c !== "ללא כיתה") neededClasses.add(c);
                    });
                }
            }
        }

        // Auto-provision missing workGroups
        for (const wgName of neededWorkGroups) {
            if (!classMap.has(wgName)) {
                const [inserted] = await db.insert(classes).values({
                    name: wgName,
                    schoolId: targetSchoolId,
                    activity: true
                }).returning({ id: classes.id });
                if (inserted) classMap.set(wgName, inserted.id);
            }
            if (!subjectMap.has(wgName)) {
                const [inserted] = await db.insert(subjects).values({
                    name: wgName,
                    schoolId: targetSchoolId,
                    activity: true
                }).returning({ id: subjects.id });
                if (inserted) subjectMap.set(wgName, inserted.id);
            }
        }

        // Auto-provision missing regular subjects
        for (const subName of neededSubjects) {
            if (!subjectMap.has(subName)) {
                const [inserted] = await db.insert(subjects).values({
                    name: subName,
                    schoolId: targetSchoolId,
                    activity: false
                }).returning({ id: subjects.id });
                if (inserted) subjectMap.set(subName, inserted.id);
            }
        }

        // Auto-provision missing regular classes
        for (const clsName of neededClasses) {
            let classId = classMap.get(clsName);
            if (!classId) {
                const code = normalizeClassCode(clsName);
                if (code) classId = classCodeMap.get(code);
            }
            if (!classId) {
                const [inserted] = await db.insert(classes).values({
                    name: clsName,
                    schoolId: targetSchoolId,
                    activity: false
                }).returning({ id: classes.id });
                if (inserted) {
                    classMap.set(clsName, inserted.id);
                    const code = normalizeClassCode(clsName);
                    if (code) classCodeMap.set(code, inserted.id);
                }
            }
        }

        const toInsert: NewAnnualScheduleSchema[] = [];

        for (const teacherSched of schedules) {
            const { teacherName, scheduleItems } = teacherSched;
            const teacherId = teacherMap.get(teacherName);

            if (!teacherId) {
                continue;
            }

            for (const item of scheduleItems) {
                if (item.className === "ללא כיתה" && item.subjectName === "ללא מקצוע") {
                    continue;
                }

                const isWorkGroup = item.className === "קבוצה";

                if (isWorkGroup) {
                    const classId = classMap.get(item.subjectName);
                    const subjectId = subjectMap.get(item.subjectName);

                    if (classId && subjectId) {
                        toInsert.push({
                            schoolId: targetSchoolId,
                            teacherId: teacherId,
                            day: item.day,
                            hour: item.hour,
                            classId: classId,
                            subjectId: subjectId,
                        });
                    }
                } else {
                    const classNames = item.className.split(",").map(c => c.trim()).filter(Boolean);
                    const subjectId = subjectMap.get(item.subjectName);

                    for (const singleClassName of classNames) {
                        let classId = classMap.get(singleClassName);
                        if (!classId && singleClassName !== "ללא כיתה") {
                            const code = normalizeClassCode(singleClassName);
                            if (code) {
                                classId = classCodeMap.get(code);
                            }
                        }

                        if (classId && subjectId) {
                            toInsert.push({
                                schoolId: targetSchoolId,
                                teacherId: teacherId,
                                day: item.day,
                                hour: item.hour,
                                classId: classId,
                                subjectId: subjectId,
                            });
                        }
                    }
                }
            }
        }

        // Reset and clear all previous annual schedules for this school
        await db.delete(annualSchedule).where(eq(annualSchedule.schoolId, targetSchoolId));
        await db.delete(annualScheduleAlt).where(eq(annualScheduleAlt.schoolId, targetSchoolId));

        // Insert new schedule rows
        if (toInsert.length > 0) {
            await db.insert(annualSchedule).values(toInsert);
        }

        revalidatePath('/annual-import');
        revalidatePath('/annual-build-teacher');
        revalidatePath('/annual-build-class');
        revalidatePath('/annual-view');

        clearAnnualScheduleCache(targetSchoolId);
        revalidateTag(cacheTags.schoolSchedule(targetSchoolId));
        void pushSyncUpdateServer(ENTITIES_DATA_CHANGED, { schoolId: targetSchoolId });

        return { success: true, message: `כל המערכות נשמרו בהצלחה!` };

    } catch (error: any) {
        dbLog({
            description: `Error in saveAllTeachersSchedulesAction: ${error instanceof Error ? error.message : String(error)}`,
            schoolId,
        });
        return { success: false, message: `Error: ${error.message}` };
    }
}
