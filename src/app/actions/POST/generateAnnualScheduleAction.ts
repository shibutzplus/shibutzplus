"use server";

//
//  Import Schedule from CSV
//
import { db } from "@/db";
import { annualSchedule, classes, subjects, teachers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { parseCsvToBlocks, extractNameFromBlock, CsvAnalysisConfig, findBestMatch } from "@/utils/importUtils";
import { ActionResponse } from "@/models/types/actions";

type ScheduleCell = {
    day: number;
    hour: number;
    subjectId?: string;
    subjectName?: string; // For display/fallback
    classId?: string;
    className?: string; // For display/fallback
    isActivity?: boolean;
};

type GenerateResult = {
    schedule: ScheduleCell[];
    teacherName: string; // The name found in CSV
    teacherId?: string; // The matched DB ID
};

type ErrorRecord = {
    teacherName: string;
    day: number;
    hour: number;
    cellContent: string;
    reason: string;
};

export async function generateAnnualScheduleAction(
    schoolId: string,
    csvData: string[][],
    config: CsvAnalysisConfig & { classLine?: number | string }, // classLine defaults to 2 if missing
    targetTeacherId?: string,
    saveToDb: boolean = false
): Promise<ActionResponse<Partial<GenerateResult> & { errors?: ErrorRecord[] }>> {
    try {
        if (!schoolId) return { success: false, message: "School ID missing" };

        const allTeachers = await db.select().from(teachers).where(eq(teachers.schoolId, schoolId));
        const allSubjects = await db.select().from(subjects).where(eq(subjects.schoolId, schoolId));
        const allClasses = await db.select().from(classes).where(eq(classes.schoolId, schoolId));

        const blocks = parseCsvToBlocks(csvData, config);
        const teacherNames = allTeachers.map(t => t.name);
        const subjectNames = allSubjects.map(s => s.name);
        const classNames = allClasses.map(c => c.name);

        const errors: ErrorRecord[] = [];

        for (const block of blocks) {
            const csvTeacherName = extractNameFromBlock(block, config);
            if (!csvTeacherName) continue;

            let matchedTeacherId: string | undefined;
            const exactOrSubset = allTeachers.find(t =>
                csvTeacherName.includes(t.name) || t.name.includes(csvTeacherName)
            );

            if (exactOrSubset) {
                matchedTeacherId = exactOrSubset.id;
            } else {
                const { bestMatch } = findBestMatch(csvTeacherName, teacherNames, 90);
                if (bestMatch) {
                    matchedTeacherId = allTeachers.find(t => t.name === bestMatch)?.id;
                }
            }

            // If target teacher specified, skip others
            if (targetTeacherId && matchedTeacherId !== targetTeacherId) {
                continue;
            }

            // If saving to DB but teacher not matched, skip (or maybe log error?)
            if (!matchedTeacherId && saveToDb) {
                continue;
            }

            const schedule: ScheduleCell[] = [];

            if (block.length >= config.dataStartRow) {
                const headerRowIdx = config.headerRow - 1;
                const headerRow = csvData[headerRowIdx];
                if (!headerRow) continue;

                for (let r = 0; r < block.length; r++) {
                    if (r < config.dataStartRow - 1) continue;

                    const row = block[r];
                    let hour = r - (config.dataStartRow - 1) + 1;
                    if (config.hourColumn) {
                        const hourCell = row[config.hourColumn - 1];
                        const parsed = parseInt(hourCell);
                        if (!isNaN(parsed)) hour = parsed;
                    }

                    const hourColIdx = config.hourColumn ? config.hourColumn - 1 : -1;

                    for (let c = 0; c < row.length; c++) {
                        if (c === hourColIdx) continue;
                        const cellContent = row[c];
                        if (!cellContent || !cellContent.trim()) continue;

                        const dayName = headerRow[c];
                        let day = -1;
                        if (dayName.includes("ראשון")) day = 1;
                        else if (dayName.includes("שני")) day = 2;
                        else if (dayName.includes("שלישי")) day = 3;
                        else if (dayName.includes("רביעי")) day = 4;
                        else if (dayName.includes("חמישי")) day = 5;
                        else if (dayName.includes("שישי")) day = 6;

                        if (day === -1) continue;

                        const lines = cellContent.split("\n").map(l => l.trim()).filter(l => l.length > 0);
                        if (lines.length === 0) continue;

                        let subjectPart = "";
                        let classPart = "";
                        const classLineParam = config.classLine || 2;

                        let classLineIdx = -1;
                        if (classLineParam === "first" || classLineParam === 1) classLineIdx = 0;
                        else if (classLineParam === "last") classLineIdx = lines.length - 1;
                        else classLineIdx = (typeof classLineParam === 'string' ? parseInt(classLineParam) : classLineParam) - 1;

                        let subjectLineIdx = 0;
                        if (classLineIdx === 0) subjectLineIdx = 1;

                        if (lines.length > classLineIdx && classLineIdx >= 0) classPart = lines[classLineIdx];
                        if (lines.length > subjectLineIdx && subjectLineIdx >= 0) subjectPart = lines[subjectLineIdx];

                        let matchedSubjectId: string | undefined;
                        let matchedSubjectName = subjectPart;

                        if (subjectPart) {
                            const cleanSub = subjectPart.split(",")[0].trim();
                            const exactOrSubsetSub = allSubjects.find(s => cleanSub.includes(s.name) || s.name.includes(cleanSub));
                            if (exactOrSubsetSub) {
                                matchedSubjectId = exactOrSubsetSub.id;
                                matchedSubjectName = exactOrSubsetSub.name;
                            } else {
                                const { bestMatch } = findBestMatch(cleanSub, subjectNames, 80);
                                if (bestMatch) {
                                    matchedSubjectId = allSubjects.find(s => s.name === bestMatch)?.id;
                                    matchedSubjectName = bestMatch;
                                }
                            }
                        }

                        let matchedClassId: string | undefined;
                        let matchedClassName = classPart;

                        if (classPart) {
                            const cleanClass = classPart.split(",")[0].trim();
                            const exactOrSubsetClass = allClasses.find(c => cleanClass.includes(c.name) || c.name.includes(cleanClass));
                            if (exactOrSubsetClass) {
                                matchedClassId = exactOrSubsetClass.id;
                                matchedClassName = exactOrSubsetClass.name;
                            } else {
                                const { bestMatch } = findBestMatch(cleanClass, classNames, 80);
                                if (bestMatch) {
                                    matchedClassId = allClasses.find(c => c.name === bestMatch)?.id;
                                    matchedClassName = bestMatch;
                                }
                            }
                        }

                        if ((!matchedSubjectId || !matchedClassId) && saveToDb) {
                            const reason = [];
                            if (!matchedSubjectId) reason.push(`Subject '${subjectPart}' not found`);
                            if (!matchedClassId) reason.push(`Class '${classPart}' not found`);

                            errors.push({
                                teacherName: csvTeacherName,
                                day,
                                hour,
                                cellContent: cellContent.replace(/\n/g, " "),
                                reason: reason.join(", ")
                            });
                        }

                        schedule.push({
                            day,
                            hour,
                            subjectId: matchedSubjectId,
                            subjectName: matchedSubjectName,
                            classId: matchedClassId,
                            className: matchedClassName
                        });
                    }
                }
            }

            if (targetTeacherId && !saveToDb) {
                return {
                    success: true,
                    data: {
                        schedule,
                        teacherName: csvTeacherName,
                        teacherId: matchedTeacherId
                    }
                };
            }

            if (saveToDb && matchedTeacherId) {
                await db.delete(annualSchedule).where(and(
                    eq(annualSchedule.schoolId, schoolId),
                    eq(annualSchedule.teacherId, matchedTeacherId)
                ));

                const validRecords = schedule.filter(s => s.subjectId && s.classId);

                if (validRecords.length > 0) {
                    await db.insert(annualSchedule).values(validRecords.map(s => ({
                        schoolId,
                        teacherId: matchedTeacherId!,
                        day: s.day,
                        hour: s.hour,
                        subjectId: s.subjectId!,
                        classId: s.classId!
                    })));
                } else {
                    console.warn(`[generateAnnualScheduleAction] Teacher ${csvTeacherName}: No valid records to save.`);
                }
            }
        }

        return {
            success: true,
            message: "המערכת עודכנה בהצלחה",
            data: { errors }
        };

    } catch (e) {
        console.error(e);
        return { success: false, message: "שגיאה בייבוא המערכת" };
    }
}
