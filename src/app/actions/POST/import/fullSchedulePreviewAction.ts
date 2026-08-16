"use server";

import { dbLog } from "@/services/loggerService";
import { extractParagraphsFromDocx, normalizeClassCode } from "@/services/importAnnual/docxUtils";

async function getXLSX() {
    const libName = "xlsx";
    return await import(libName);
}

// Types
interface ScheduleItem {
    teacher: string;
    class: string;
    subject: string;
    day: number;
    hour: number;
    originalText?: string;
}

interface ServiceResponse {
    success: boolean;
    data?: {
        teachers: string[];
        classes: string[];
        workGroups: string[];
        subjects: string[];
        schedule: ScheduleItem[];
        unmapped: string[];
    };
    message?: string;
}

function cleanCSVValue(val: string): string {
    let clean = val.trim();
    if (clean.startsWith('"') && clean.endsWith('"') && clean.length > 2) {
        clean = clean.slice(1, -1);
    }
    clean = clean.replace(/""/g, '"');
    // Normalize Hebrew/Smart quotes to standard single quote
    clean = clean.replace(/[\u2018\u2019\u05F3\u00B4`]/g, "'");
    // Replace line breaks with spaces to handle merged cells
    clean = clean.replace(/[\r\n]+/g, ' ');
    return clean.trim();
}

export const fullSchedulePreviewAction = async (
    formData: FormData,
    entities: { teachers: string[], classes: string[], subjects: string[], workGroups: string[] }
): Promise<ServiceResponse> => {
    let schoolId: string | undefined;
    try {
        schoolId = formData.get("schoolId") as string || undefined;

        const teacherFile = formData.get("teacherFile") as File | null;
        const classFile = formData.get("classFile") as File | null;
        const teacherWordFile = formData.get("teacherWordFile") as File | null;

        const isWordMode = !!teacherWordFile;

        if (!isWordMode && (!teacherFile || !classFile)) {
            return { success: false, message: "Missing files" };
        }

        const DAY_HEADERS: Record<string, number> = { "ראשון": 1, "שני": 2, "שלישי": 3, "רביעי": 4, "חמישי": 5, "שישי": 6 };

        // Normalized lookups
        const normalizedTeachers = entities.teachers.map(t => ({ original: t, clean: cleanCSVValue(t) }));
        const normalizedSubjects = entities.subjects.map(s => ({ original: s, clean: cleanCSVValue(s) }));
        const normalizedClasses = entities.classes.map(c => ({
            original: c,
            clean: cleanCSVValue(c),
            code: normalizeClassCode(c),
        }));
        const normalizedWorkGroups = entities.workGroups.map(w => ({ original: w, clean: cleanCSVValue(w) }));

        // ------------------ WORD (DOCX) FLOW ------------------
        if (isWordMode) {
            const teacherBuffer = await teacherWordFile!.arrayBuffer().then(ab => Buffer.from(ab));
            const teacherParagraphs = extractParagraphsFromDocx(teacherBuffer);

            const stripQuotes = (s: string) => s.replace(/['"״׳\u05F4\u05F3\u201C\u201D\u2018\u2019]/g, "").replace(/\s+/g, " ").trim();

            const scheduleItems: ScheduleItem[] = [];
            let currentTeacher: string | null = null;
            let currentTeacherDay: number | null = null;

            for (let i = 0; i < teacherParagraphs.length; i++) {
                const cleanLine = cleanCSVValue(teacherParagraphs[i]);

                if (cleanLine.includes("מערכת שעות מורה")) {
                    const rawTeacherName = cleanLine.replace(/מערכת שעות\s+מורה\s+/, "").trim();
                    const cleanRawTeacher = stripQuotes(rawTeacherName);
                    
                    let matchedTeacher = normalizedTeachers.find(t => stripQuotes(t.clean) === cleanRawTeacher);
                    if (!matchedTeacher) {
                        matchedTeacher = normalizedTeachers
                            .filter(t => {
                                const cleanT = stripQuotes(t.clean);
                                return cleanRawTeacher.includes(cleanT) || cleanT.includes(cleanRawTeacher);
                            })
                            .sort((a, b) => b.clean.length - a.clean.length)[0];
                    }
                    currentTeacher = matchedTeacher ? matchedTeacher.original : null;
                    
                    continue;
                }

                if (currentTeacher) {
                    let foundDay = false;
                    for (const [dayName, dayNum] of Object.entries(DAY_HEADERS)) {
                        if (cleanLine === `יום ${dayName}` || cleanLine === dayName) {
                            currentTeacherDay = dayNum;
                            foundDay = true;
                            break;
                        }
                    }
                    if (foundDay) continue;

                    const parts = cleanLine.split(",").map(p => p.trim());
                    if (parts.length >= 1 && currentTeacherDay) {
                        const nextLine = i + 1 < teacherParagraphs.length ? cleanCSVValue(teacherParagraphs[i + 1]) : "";
                        const hourMatch = nextLine.match(/שעה\s+(\d+)/);
                        if (hourMatch) {
                            const hour = parseInt(hourMatch[1]);

                            let finalSub = "";
                            let finalCls = "";

                            if (parts.length >= 2) {
                                const candidateSub = parts[0];
                                const cleanCandidateSub = stripQuotes(candidateSub);
                                const otherParts = parts.slice(1);

                                // For Word mode, we match names (work groups or subjects)
                                const exactWg = normalizedWorkGroups.find(w => stripQuotes(w.clean) === cleanCandidateSub || w.clean === cleanCandidateSub);
                                if (exactWg) {
                                    finalSub = exactWg.original;
                                    finalCls = "קבוצה";
                                } else {
                                    const exactSub = normalizedSubjects.find(s => stripQuotes(s.clean) === cleanCandidateSub || s.clean === cleanCandidateSub);
                                    if (exactSub) {
                                        finalSub = exactSub.original;
                                    }

                                    // Check if any of otherParts explicitly mentions the current teacher
                                    const cleanCurrentTeacher = stripQuotes(currentTeacher);
                                    const teacherSpecificParts = otherParts.filter(p => {
                                        const cleanP = stripQuotes(p);
                                        if (cleanP.includes(cleanCurrentTeacher) || cleanCurrentTeacher.includes(cleanP)) return true;
                                        // Match if teacher first/last name parts are contained
                                        const teacherWords = cleanCurrentTeacher.split(" ").filter(w => w.length >= 2);
                                        return teacherWords.length >= 2 && teacherWords.every(w => cleanP.includes(w));
                                    });

                                    const targetParts = teacherSpecificParts.length > 0 ? teacherSpecificParts : otherParts;
                                    const matchedClassesSet = new Set<string>();

                                    for (const part of targetParts) {
                                        const candClsCode = normalizeClassCode(part);
                                        const cleanPart = stripQuotes(part);
                                        const exactCls = normalizedClasses.find(c =>
                                            (candClsCode && c.code && c.code === candClsCode) ||
                                            stripQuotes(c.clean) === cleanPart ||
                                            c.clean === cleanPart ||
                                            c.original === part
                                        );
                                        if (exactCls) {
                                            matchedClassesSet.add(exactCls.original);
                                        }
                                    }

                                    if (matchedClassesSet.size > 0) {
                                        finalCls = Array.from(matchedClassesSet).join(", ");
                                    }
                                }
                            } else {
                                // Single part on line (e.g. "מתמטיקה א1")
                                const singleText = parts[0];
                                const singleCode = normalizeClassCode(singleText);

                                const exactWg = normalizedWorkGroups.find(w => singleText.includes(w.clean));
                                if (exactWg) {
                                    finalSub = exactWg.original;
                                    finalCls = "קבוצה";
                                } else {
                                    const exactSub = normalizedSubjects.find(s => singleText.includes(s.clean));
                                    if (exactSub) finalSub = exactSub.original;

                                    const exactCls = normalizedClasses.find(c => (singleCode && c.code && c.code === singleCode) || singleText.includes(c.clean));
                                    if (exactCls) finalCls = exactCls.original;
                                }
                            }

                            if (finalSub || finalCls) {
                                scheduleItems.push({
                                    teacher: currentTeacher,
                                    class: finalCls || "ללא כיתה",
                                    subject: finalSub || "ללא מקצוע",
                                    day: currentTeacherDay,
                                    hour: hour,
                                    originalText: cleanLine
                                });
                            }
                            i++; // Skip the hour paragraph in the next iteration
                        }
                    }
                }
            }

            dbLog({
                description: `[fullSchedulePreviewAction] Generated Word schedule with ${scheduleItems.length} lessons`,
                schoolId
            });

            return {
                success: true,
                data: {
                    teachers: entities.teachers,
                    classes: entities.classes,
                    workGroups: entities.workGroups,
                    subjects: entities.subjects,
                    schedule: scheduleItems,
                    unmapped: []
                },
                message: `Successfully constructed schedule from Word with ${scheduleItems.length} lessons.`
            };
        }

        // ------------------ EXCEL/CSV FLOW ------------------
        const teacherBuffer = Buffer.from(await teacherFile!.arrayBuffer());
        const classBuffer = Buffer.from(await classFile!.arrayBuffer());

        // Parse Class File to build Original Text Map
        const classOriginalTextMap = new Map<string, string>();

        try {
            const XLSX = await getXLSX();
            const classWorkbook = XLSX.read(classBuffer, { type: 'buffer' });
            classWorkbook.SheetNames.forEach((sheetName: string) => {
                const classSheet = classWorkbook.Sheets[sheetName];
                const classRows: any[][] = XLSX.utils.sheet_to_json(classSheet, { header: 1, defval: null });

                let currentClass: string | null = null;
                let dayMap: Record<number, number> | null = null;
                let hourColIndex: number = -1;

                for (let rowIndex = 0; rowIndex < classRows.length; rowIndex++) {
                    const row = classRows[rowIndex];
                    if (!row || row.length === 0) continue;

                    // Detect Class Block by searching for known class names in the row
                    let foundClassHeader = false;
                    for (const cell of row) {
                        if (typeof cell === 'string') {
                            const cleanCell = cleanCSVValue(cell);
                            const matchedCls = normalizedClasses
                                .filter(c => cleanCell.includes(c.clean))
                                .sort((a, b) => b.clean.length - a.clean.length)[0];

                            if (matchedCls) {
                                currentClass = matchedCls.original;
                                dayMap = null;
                                hourColIndex = -1;
                                foundClassHeader = true;
                                break;
                            }
                        }
                    }
                    if (foundClassHeader) continue;

                    if (currentClass && !dayMap) {
                        const potentialDayMap: Record<number, number> = {};
                        let foundDays = 0;
                        let foundHourCol = -1;

                        row.forEach((cell, colIdx) => {
                            if (typeof cell === 'string') {
                                const clean = cleanCSVValue(cell);
                                if (DAY_HEADERS[clean]) {
                                    potentialDayMap[colIdx] = DAY_HEADERS[clean];
                                    foundDays++;
                                } else if (clean.includes("שעה") || clean.includes("זמן")) {
                                    foundHourCol = colIdx;
                                }
                            }
                        });

                        if (foundDays >= 3) {
                            dayMap = potentialDayMap;
                            hourColIndex = foundHourCol;
                            continue;
                        }
                    }

                    if (currentClass && dayMap) {
                        let hour = 0;
                        let hourCell: any = null;
                        if (hourColIndex !== -1) hourCell = row[hourColIndex];
                        if (!hourCell) {
                            const lastIdx = row.length - 1;
                            if (/\d/.test(String(row[lastIdx]))) hourCell = row[lastIdx];
                            else if (/\d/.test(String(row[0]))) hourCell = row[0];
                        }

                        if (typeof hourCell === 'number') hour = hourCell;
                        else if (typeof hourCell === 'string') {
                            const match = hourCell.match(/^(\d+)/);
                            if (match) hour = parseInt(match[1]);
                        }

                        if (hour > 0 && hour <= 12) {
                            const hourRows = [row];
                            let nextIdx = rowIndex + 1;

                            while (nextIdx < classRows.length) {
                                const nextRow = classRows[nextIdx];
                                if (!nextRow) break;

                                let hasNewHour = false;
                                if (hourColIndex !== -1 && nextRow[hourColIndex]) {
                                    const nextHourCell = nextRow[hourColIndex];
                                    if (typeof nextHourCell === 'number' || (typeof nextHourCell === 'string' && /^\d+/.test(nextHourCell))) {
                                        hasNewHour = true;
                                    }
                                }

                                let isNextTitle = false;
                                for (const cell of nextRow) {
                                    if (typeof cell === 'string') {
                                        const clean = cleanCSVValue(cell);
                                        if (normalizedClasses.some(c => clean.includes(c.clean))) {
                                            isNextTitle = true;
                                            break;
                                        }
                                    }
                                }

                                if (hasNewHour || isNextTitle) break;

                                hourRows.push(nextRow);
                                nextIdx++;
                            }

                            for (const [colIdxStr, day] of Object.entries(dayMap)) {
                                const colIdx = parseInt(colIdxStr);
                                let combinedText = "";
                                for (const hRow of hourRows) {
                                    const cell = hRow[colIdx];
                                    if (cell && typeof cell === 'string' && cell.trim().length > 0) {
                                        combinedText += " " + cell;
                                    }
                                }

                                const cleanContent = cleanCSVValue(combinedText);
                                if (cleanContent) {
                                    const key = `${currentClass}|${day}|${hour}`;
                                    classOriginalTextMap.set(key, cleanContent);
                                }
                            }
                            rowIndex = nextIdx - 1;
                        }
                    }
                }
            });
        } catch (err) {
            dbLog({ description: `Error parsing class file: ${err instanceof Error ? err.message : String(err)}`, schoolId });
        }

        // Parse Teacher CSV
        const XLSX = await getXLSX();
        const workbook = XLSX.read(teacherBuffer, { type: 'buffer' });
        const scheduleItems: ScheduleItem[] = [];

        // Regex helpers
        const TEACHER_TITLE_REGEX = /מערכת שעות למורה|למורה/i;

        workbook.SheetNames.forEach((sheetName: string) => {
            const worksheet = workbook.Sheets[sheetName];
            const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });

            // State Machine Variables (Reset per sheet)
            let currentTeacher: string | null = null;
            let dayMap: Record<number, number> | null = null; // ColIndex -> Day
            let hourColIndex: number = -1;

            for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
                const row = rows[rowIndex];
                if (!row || row.length === 0) continue;

                // 1. Detect Teacher Block Start
                const titleMatch = row.find(cell => typeof cell === 'string' && TEACHER_TITLE_REGEX.test(cell));
                if (titleMatch) {
                    const cleanTitle = cleanCSVValue(titleMatch.replace(TEACHER_TITLE_REGEX, ''));

                    // Reset internal block state
                    currentTeacher = null;
                    dayMap = null;
                    hourColIndex = -1;

                    const teacher = normalizedTeachers.find(t => cleanTitle.includes(t.clean) || t.clean.includes(cleanTitle));
                    if (teacher) {
                        currentTeacher = teacher.original;
                        continue;
                    }
                }

                // 2. Detect Block Headers (Days & Hour)
                if (currentTeacher && !dayMap) {
                    const potentialDayMap: Record<number, number> = {};
                    let foundDays = 0;
                    let foundHourCol = -1;

                    row.forEach((cell, colIdx) => {
                        if (typeof cell === 'string') {
                            const clean = cleanCSVValue(cell);
                            if (DAY_HEADERS[clean]) {
                                potentialDayMap[colIdx] = DAY_HEADERS[clean];
                                foundDays++;
                            } else if (clean.includes("שעה") || clean.includes("זמן")) {
                                foundHourCol = colIdx;
                            }
                        }
                    });

                    if (foundDays >= 3) {
                        dayMap = potentialDayMap;
                        hourColIndex = foundHourCol;
                        continue;
                    }
                }

                // 3. Extract Lesson Data
                if (currentTeacher && dayMap) {
                    let hour = 0;
                    let hourCell: any = null;

                    if (hourColIndex !== -1) hourCell = row[hourColIndex];
                    if (!hourCell) {
                        const lastIdx = row.length - 1;
                        if (/\d/.test(String(row[lastIdx]))) hourCell = row[lastIdx];
                        else if (/\d/.test(String(row[0]))) hourCell = row[0];
                    }

                    if (typeof hourCell === 'number') hour = hourCell;
                    else if (typeof hourCell === 'string') {
                        const match = hourCell.match(/^(\d+)/);
                        if (match) hour = parseInt(match[1]);
                    }

                    if (hour > 0 && hour <= 12) {
                        const hourRows = [row];
                        let nextIdx = rowIndex + 1;

                        while (nextIdx < rows.length) {
                            const nextRow = rows[nextIdx];
                            if (!nextRow) break;

                            let hasNewHour = false;
                            if (hourColIndex !== -1 && nextRow[hourColIndex]) {
                                const nextHourCell = nextRow[hourColIndex];
                                if (typeof nextHourCell === 'number' ||
                                    (typeof nextHourCell === 'string' && /^\d+/.test(nextHourCell))) {
                                    hasNewHour = true;
                                }
                            }

                            const isNextTitle = nextRow.some((c: any) => typeof c === 'string' && TEACHER_TITLE_REGEX.test(c));

                            if (hasNewHour || isNextTitle) break;

                            hourRows.push(nextRow);
                            nextIdx++;
                        }

                        for (const [colIdxStr, day] of Object.entries(dayMap)) {
                            const colIdx = parseInt(colIdxStr);
                            let combinedText = "";
                            for (const hourRow of hourRows) {
                                const cell = hourRow[colIdx];
                                if (cell && typeof cell === 'string' && cell.trim().length > 0) {
                                    combinedText += " " + cell;
                                }
                            }

                            const trimmed = combinedText.trim();
                            if (trimmed.length === 0 || /^[\s\u00A0]+$/.test(trimmed)) continue;

                            const cleanContent = cleanCSVValue(combinedText);
                            let finalSub = "";
                            let finalCls = "";

                            const wgMatch = normalizedWorkGroups
                                .filter(w => cleanContent.includes(w.clean))
                                .sort((a, b) => b.clean.length - a.clean.length)[0];

                            if (wgMatch) {
                                finalSub = wgMatch.original;
                                finalCls = "קבוצה";
                            } else {
                                const subMatch = normalizedSubjects
                                    .filter(s => cleanContent.includes(s.clean))
                                    .sort((a, b) => b.clean.length - a.clean.length)[0];

                                if (subMatch) finalSub = subMatch.original;

                                const clsMatch = normalizedClasses
                                    .filter(c => {
                                        if (cleanContent.includes(c.clean)) return true;
                                        if (c.code && normalizeClassCode(cleanContent) === c.code) return true;
                                        if (c.code && cleanContent.includes(c.code)) return true;
                                        return false;
                                    })
                                    .sort((a, b) => b.clean.length - a.clean.length)[0];

                                if (clsMatch) finalCls = clsMatch.original;
                            }

                            if (finalSub || finalCls) {
                                let classFileOriginalText = "";
                                if (finalCls && finalCls !== "קבוצה" && finalCls !== "ללא כיתה") {
                                    const key = `${finalCls}|${Number(day)}|${hour}`;
                                    classFileOriginalText = classOriginalTextMap.get(key) || "";
                                }

                                scheduleItems.push({
                                    teacher: currentTeacher!,
                                    class: finalCls || "ללא כיתה",
                                    subject: finalSub || "ללא מקצוע",
                                    day: Number(day),
                                    hour: hour,
                                    originalText: classFileOriginalText || cleanContent
                                });
                            }
                        }
                        rowIndex = nextIdx - 1;
                    }
                }
            }
        });

        return {
            success: true,
            data: {
                teachers: entities.teachers,
                classes: entities.classes,
                workGroups: entities.workGroups,
                subjects: entities.subjects,
                schedule: scheduleItems,
                unmapped: []
            },
            message: `Successfully constructed schedule with ${scheduleItems.length} lessons.`
        };

    } catch (error) {
        const err = error as Error;
        dbLog({ description: `Schedule generation failed: ${err.message}`, schoolId });
        return {
            success: false,
            message: `Schedule generation failed: ${err.message}`
        };
    }
};
