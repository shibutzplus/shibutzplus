"use server";

import { dbLog } from "@/services/loggerService";
import { extractParagraphsFromDocx, normalizeClassCode } from "@/services/importAnnual/docxUtils";
import * as XLSX from "xlsx";

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

function cleanCellValue(val: string): string {
    let clean = val.trim();
    if (clean.startsWith('"') && clean.endsWith('"') && clean.length > 2) {
        clean = clean.slice(1, -1);
    }
    clean = clean.replace(/""/g, '"');
    // Remove (ש) or (פ) or [ש] annotations
    clean = clean.replace(/\s*[\(\[]\s*[שפ]\s*[\)\]]/g, "");
    // Normalize Hebrew/Smart quotes to standard single quote
    clean = clean.replace(/[\u2018\u2019\u05F3\u00B4`]/g, "'");
    // Replace dots with spaces (e.g. "ארוחת.צהרים" -> "ארוחת צהרים")
    clean = clean.replace(/\./g, ' ');
    // Replace line breaks with spaces to handle merged cells
    clean = clean.replace(/[\r\n]+/g, ' ');
    // Collapse multiple spaces
    clean = clean.replace(/\s+/g, ' ');
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

        const aliasesStr = formData.get("aliases") as string | null;
        const aliases: Record<string, string> = aliasesStr ? JSON.parse(aliasesStr) : {};

        const isWordMode = !!teacherWordFile;

        if (!isWordMode && (!teacherFile || !classFile)) {
            return { success: false, message: "Missing files" };
        }

        const DAY_HEADERS: Record<string, number> = {
            "ראשון": 1, "שני": 2, "שלישי": 3, "רביעי": 4, "חמישי": 5, "שישי": 6,
            "יום ראשון": 1, "יום שני": 2, "יום שלישי": 3, "יום רביעי": 4, "יום חמישי": 5, "יום שישי": 6,
            "יום א": 1, "יום ב": 2, "יום ג": 3, "יום ד": 4, "יום ה": 5, "יום ו": 6,
            "יום א'": 1, "יום ב'": 2, "יום ג'": 3, "יום ד'": 4, "יום ה'": 5, "יום ו'": 6,
            "א": 1, "ב": 2, "ג": 3, "ד": 4, "ה": 5, "ו": 6,
            "א'": 1, "ב'": 2, "ג'": 3, "ד'": 4, "ה'": 5, "ו'": 6,
        };

        // Normalized lookups
        const normalizedTeachers = entities.teachers.map(t => ({ original: t, clean: cleanCellValue(t) }));
        const normalizedSubjects = entities.subjects.map(s => ({ original: s, clean: cleanCellValue(s) }));
        const normalizedClasses = entities.classes.map(c => ({
            original: c,
            clean: cleanCellValue(c),
            code: normalizeClassCode(c),
        }));
        const normalizedWorkGroups = entities.workGroups.map(w => ({ original: w, clean: cleanCellValue(w) }));

        // ------------------ WORD (DOCX) FLOW ------------------
        if (isWordMode) {
            const teacherBuffer = await teacherWordFile!.arrayBuffer().then(ab => Buffer.from(ab));
            const teacherParagraphs = extractParagraphsFromDocx(teacherBuffer);

            const stripQuotes = (s: string) => s.replace(/['"״׳\u05F4\u05F3\u201C\u201D\u2018\u2019]/g, "").replace(/\s+/g, " ").trim();

            const scheduleItems: ScheduleItem[] = [];
            let currentTeacher: string | null = null;
            let currentTeacherDay: number | null = null;

            for (let i = 0; i < teacherParagraphs.length; i++) {
                const cleanLine = cleanCellValue(teacherParagraphs[i]);

                if (cleanLine.includes("מערכת שעות מורה") || cleanLine.includes("מערכת שעות למורה")) {
                    const rawTeacherName = cleanLine.replace(/מערכת שעות\s+(?:ל?מורה|מורה:?)\s*/, "").trim();
                    const cleanRawTeacher = stripQuotes(rawTeacherName);
                    const aliased = aliases[cleanRawTeacher] || cleanRawTeacher;

                    let matchedTeacher = normalizedTeachers.find(t => stripQuotes(t.clean) === aliased || stripQuotes(t.original) === aliased || stripQuotes(t.clean) === cleanRawTeacher || stripQuotes(t.original) === cleanRawTeacher);
                    if (!matchedTeacher) {
                        const rawWords = cleanRawTeacher.split(" ").filter(Boolean);
                        matchedTeacher = normalizedTeachers.find(t => {
                            const tWords = stripQuotes(t.clean).split(" ").filter(Boolean);
                            if (rawWords.length >= 2 && tWords.length === rawWords.length) {
                                return rawWords.slice().sort().join(" ") === tWords.slice().sort().join(" ");
                            }
                            return false;
                        });
                    }
                    if (!matchedTeacher && aliased !== cleanRawTeacher) {
                        const aliasedWords = aliased.split(" ").filter(Boolean);
                        matchedTeacher = normalizedTeachers.find(t => {
                            const tWords = stripQuotes(t.clean).split(" ").filter(Boolean);
                            if (aliasedWords.length >= 2 && tWords.length === aliasedWords.length) {
                                return aliasedWords.slice().sort().join(" ") === tWords.slice().sort().join(" ");
                            }
                            return false;
                        });
                    }
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
                        const nextLine = i + 1 < teacherParagraphs.length ? cleanCellValue(teacherParagraphs[i + 1]) : "";
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
                                } else {
                                    const exactSub = normalizedSubjects.find(s => stripQuotes(s.clean) === cleanCandidateSub || s.clean === cleanCandidateSub);
                                    if (exactSub) {
                                        finalSub = exactSub.original;
                                    } else {
                                        finalSub = candidateSub;
                                    }
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
                                    const subParts = part.split(/[,/]+/).map(p => p.trim()).filter(Boolean);
                                    for (const subPart of subParts) {
                                        const candClsCode = normalizeClassCode(subPart);
                                        const cleanPart = stripQuotes(subPart);
                                        const exactCls = normalizedClasses.find(c =>
                                            (candClsCode && c.code && c.code === candClsCode) ||
                                            stripQuotes(c.clean) === cleanPart ||
                                            c.clean === cleanPart ||
                                            c.original === subPart
                                        );
                                        if (exactCls) {
                                            matchedClassesSet.add(exactCls.original);
                                        }
                                    }
                                }

                                if (matchedClassesSet.size > 0) {
                                    finalCls = Array.from(matchedClassesSet).join(", ");
                                } else if (exactWg) {
                                    finalCls = "קבוצה";
                                }
                            } else {
                                // Single part on line (e.g. "מתמטיקה א1")
                                const singleText = parts[0];
                                const singleCode = normalizeClassCode(singleText);

                                const exactWg = normalizedWorkGroups.find(w => singleText.includes(w.clean));
                                if (exactWg) {
                                    finalSub = exactWg.original;
                                } else {
                                    const exactSub = normalizedSubjects.find(s => singleText.includes(s.clean));
                                    if (exactSub) finalSub = exactSub.original;
                                }

                                const exactCls = normalizedClasses.find(c => (singleCode && c.code && c.code === singleCode) || singleText.includes(c.clean));
                                if (exactCls) {
                                    finalCls = exactCls.original;
                                } else if (exactWg) {
                                    finalCls = "קבוצה";
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

        // ------------------ EXCEL FLOW ------------------
        const teacherBuffer = Buffer.from(await teacherFile!.arrayBuffer());
        const classBuffer = Buffer.from(await classFile!.arrayBuffer());

        // Parse Class File to build Original Text Map
        const classOriginalTextMap = new Map<string, string>();

        try {
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
                            const cleanCell = cleanCellValue(cell);
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
                                const clean = cleanCellValue(cell);
                                if (DAY_HEADERS[clean]) {
                                    potentialDayMap[colIdx] = DAY_HEADERS[clean];
                                    foundDays++;
                                } else if (clean.includes("שעה") || clean.includes("שעור") || clean.includes("זמן")) {
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
                            const match = hourCell.match(/(\d+)/);
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
                                    if (typeof nextHourCell === 'number' || (typeof nextHourCell === 'string' && /\d+/.test(nextHourCell))) {
                                        hasNewHour = true;
                                    }
                                }

                                let isNextTitle = false;
                                for (const cell of nextRow) {
                                    if (typeof cell === 'string') {
                                        const clean = cleanCellValue(cell);
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

                                const cleanContent = cleanCellValue(combinedText);
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

        // Parse Teacher Excel
        const workbook = XLSX.read(teacherBuffer, { type: 'buffer' });
        const scheduleItems: ScheduleItem[] = [];

        // Regex helpers
        const TEACHER_TITLE_REGEX = /מערכת שעות\s+(?:ל?מורה|מורה:?)\s*(.+)/i;

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
                const titleCell = row.find(cell => typeof cell === 'string' && (cell.includes("מערכת שעות") || cell.includes("מורה")));
                if (titleCell && typeof titleCell === 'string') {
                    let rawTeacherName = "";
                    const match = titleCell.match(TEACHER_TITLE_REGEX);
                    if (match && match[1]) {
                        rawTeacherName = match[1];
                    } else {
                        rawTeacherName = titleCell.replace(/^(מערכת שעות למורה|מערכת שעות מורה|מערכת שעות|למורה|מורה:?)\s*:?/i, "");
                    }

                    const cleanTitle = cleanCellValue(rawTeacherName).replace(/[:\-,\.]/g, " ").replace(/\s+/g, " ").trim();

                    if (cleanTitle && cleanTitle.length >= 2) {
                        const aliased = aliases[cleanTitle] || cleanTitle;

                        // 1a. Exact match
                        let teacher = normalizedTeachers.find(t => t.clean === aliased || t.original === aliased || t.clean === cleanTitle || t.original === cleanTitle);

                        // 1b. Unordered word match (e.g. "אורפלי קטי" <-> "קטי אורפלי")
                        if (!teacher) {
                            const titleWords = cleanTitle.split(" ").filter(Boolean);
                            teacher = normalizedTeachers.find(t => {
                                const tWords = t.clean.split(" ").filter(Boolean);
                                if (titleWords.length >= 2 && tWords.length === titleWords.length) {
                                    return titleWords.slice().sort().join(" ") === tWords.slice().sort().join(" ");
                                }
                                return false;
                            });
                        }

                        // 1c. Aliased unordered word match
                        if (!teacher && aliased !== cleanTitle) {
                            const aliasedWords = aliased.split(" ").filter(Boolean);
                            teacher = normalizedTeachers.find(t => {
                                const tWords = t.clean.split(" ").filter(Boolean);
                                if (aliasedWords.length >= 2 && tWords.length === aliasedWords.length) {
                                    return aliasedWords.slice().sort().join(" ") === tWords.slice().sort().join(" ");
                                }
                                return false;
                            });
                        }

                        if (teacher) {
                            // Reset internal block state
                            currentTeacher = teacher.original;
                            dayMap = null;
                            hourColIndex = -1;
                            continue;
                        }
                    }
                }

                // 2. Detect Block Headers (Days & Hour)
                if (currentTeacher && !dayMap) {
                    const potentialDayMap: Record<number, number> = {};
                    let foundDays = 0;
                    let foundHourCol = -1;

                    row.forEach((cell, colIdx) => {
                        if (typeof cell === 'string') {
                            const clean = cleanCellValue(cell);
                            if (DAY_HEADERS[clean]) {
                                potentialDayMap[colIdx] = DAY_HEADERS[clean];
                                foundDays++;
                            } else if (clean.includes("שעה") || clean.includes("שעור") || clean.includes("זמן")) {
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
                        const match = hourCell.match(/(\d+)/);
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
                                    (typeof nextHourCell === 'string' && /\d+/.test(nextHourCell))) {
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
                            const cellLines: string[] = [];
                            for (const hourRow of hourRows) {
                                const cell = hourRow[colIdx];
                                if (cell && typeof cell === 'string' && cell.trim().length > 0) {
                                    cellLines.push(...cell.split(/[\r\n]+/).map(cleanCellValue).filter(Boolean));
                                }
                            }

                            if (cellLines.length === 0) continue;

                            const firstLine = cellLines[0];
                            const cleanContent = cleanCellValue(cellLines.join(" "));
                            let finalSub = "";
                            let finalCls = "";

                            // 1. WorkGroups
                            let wgMatch = normalizedWorkGroups.find(w => w.clean === firstLine);
                            if (!wgMatch) {
                                wgMatch = normalizedWorkGroups
                                    .filter(w => {
                                        const regex = new RegExp(`(^|\\s)${w.clean.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}(\\s|$)`);
                                        return regex.test(cleanContent) || cleanContent.includes(w.clean);
                                    })
                                    .sort((a, b) => b.clean.length - a.clean.length)[0];
                            }

                            if (wgMatch) {
                                finalSub = wgMatch.original;
                            } else {
                                // 2. Subjects
                                // 2a. Exact match on first line (e.g. "שפה" === "שפה")
                                let subMatch = normalizedSubjects.find(s => s.clean === firstLine);

                                // 2b. Exact whole-word phrase in cell content
                                if (!subMatch) {
                                    const subMatches = normalizedSubjects.filter(s => {
                                        const regex = new RegExp(`(^|\\s)${s.clean.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}(\\s|$)`);
                                        return regex.test(cleanContent);
                                    }).sort((a, b) => b.clean.length - a.clean.length);

                                    if (subMatches.length > 0) {
                                        subMatch = subMatches[0];
                                    }
                                }

                                // 2c. Prefix match on first line (e.g. "חשיבה חיובי" -> "חשיבה חיובית", "בית ספר מנ" -> "בית ספר מנגן")
                                if (!subMatch && firstLine.length >= 3) {
                                    subMatch = normalizedSubjects.find(s => s.clean.startsWith(firstLine) || firstLine.startsWith(s.clean));
                                }

                                if (subMatch) finalSub = subMatch.original;
                            }

                            const clsMatch = normalizedClasses
                                .filter(c => {
                                    if (cleanContent.includes(c.clean)) return true;
                                    if (c.code && normalizeClassCode(cleanContent) === c.code) return true;
                                    if (c.code && cleanContent.includes(c.code)) return true;
                                    return false;
                                })
                                .sort((a, b) => b.clean.length - a.clean.length)[0];

                            if (clsMatch) {
                                finalCls = clsMatch.original;
                            } else if (wgMatch) {
                                finalCls = "קבוצה";
                            }

                            if (finalSub || finalCls) {
                                let classFileOriginalText = "";
                                if (finalCls && finalCls !== "קבוצה" && finalCls !== "ללא כיתה") {
                                    const key = `${finalCls}|${Number(day)}|${hour}`;
                                    classFileOriginalText = classOriginalTextMap.get(key) || "";
                                }

                                const resolvedTeacher = aliases[currentTeacher!] || currentTeacher!;
                                const resolvedClass = aliases[finalCls] || finalCls || "ללא כיתה";
                                const resolvedSub = aliases[finalSub] || finalSub || "ללא מקצוע";

                                scheduleItems.push({
                                    teacher: resolvedTeacher,
                                    class: resolvedClass,
                                    subject: resolvedSub,
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
