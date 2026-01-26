"use server";

import * as XLSX from 'xlsx';


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

export const fullSchedulePreviewAction = async (formData: FormData, entities: { teachers: string[], classes: string[], subjects: string[], workGroups: string[] }): Promise<ServiceResponse> => {
    try {
        const teacherFile = formData.get("teacherFile") as File;
        const classFile = formData.get("classFile") as File;
        if (!teacherFile || !classFile) {
            return { success: false, message: "Missing files" };
        }

        const teacherBuffer = Buffer.from(await teacherFile.arrayBuffer());
        const classBuffer = Buffer.from(await classFile.arrayBuffer());

        // Parse Class File to build Original Text Map
        const classOriginalTextMap = new Map<string, string>();

        try {
            const classWorkbook = XLSX.read(classBuffer, { type: 'buffer' });
            const classSheetName = classWorkbook.SheetNames[0];
            const classSheet = classWorkbook.Sheets[classSheetName];
            const classRows: any[][] = XLSX.utils.sheet_to_json(classSheet, { header: 1, defval: null });

            const DAY_HEADERS: Record<string, number> = { "ראשון": 1, "שני": 2, "שלישי": 3, "רביעי": 4, "חמישי": 5, "שישי": 6 };

            let currentClass: string | null = null;
            let dayMap: Record<number, number> | null = null;
            let hourColIndex: number = -1;

            const normalizedClassList = entities.classes.map(c => ({ original: c, clean: cleanCSVValue(c) }));

            for (let rowIndex = 0; rowIndex < classRows.length; rowIndex++) {
                const row = classRows[rowIndex];
                if (!row || row.length === 0) continue;

                // Detect Class Block by searching for known class names in the row
                let foundClassHeader = false;
                for (const cell of row) {
                    if (typeof cell === 'string') {
                        const cleanCell = cleanCSVValue(cell);
                        // Find the longest matching class name to avoid partial matches (e.g. matching "A1" inside "A10")
                        const matchedCls = normalizedClassList
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

                    // If we found a valid hour, collect all rows for this hour (handle merged cells)
                    if (hour > 0 && hour <= 12) {
                        const hourRows = [row];
                        let nextIdx = rowIndex + 1;

                        while (nextIdx < classRows.length) {
                            const nextRow = classRows[nextIdx];
                            if (!nextRow) break;

                            // Check if next row has a new hour
                            let hasNewHour = false;
                            if (hourColIndex !== -1 && nextRow[hourColIndex]) {
                                const nextHourCell = nextRow[hourColIndex];
                                if (typeof nextHourCell === 'number' || (typeof nextHourCell === 'string' && /^\d+/.test(nextHourCell))) {
                                    hasNewHour = true;
                                }
                            }

                            // Check if next row starts a new Class Block (contains a known class name)
                            let isNextTitle = false;
                            for (const cell of nextRow) {
                                if (typeof cell === 'string') {
                                    const clean = cleanCSVValue(cell);
                                    if (normalizedClassList.some(c => clean.includes(c.clean))) {
                                        isNextTitle = true;
                                        break;
                                    }
                                }
                            }

                            if (hasNewHour || isNextTitle) break;

                            hourRows.push(nextRow);
                            nextIdx++;
                        }

                        // Process all collected rows for this hour
                        for (const [colIdxStr, day] of Object.entries(dayMap)) {
                            const colIdx = parseInt(colIdxStr);

                            // Combine text from all rows
                            let combinedText = "";
                            for (const hRow of hourRows) {
                                const cell = hRow[colIdx];
                                if (cell && typeof cell === 'string' && cell.trim().length > 0) {
                                    combinedText += " " + cell;
                                }
                            }

                            const cleanContent = cleanCSVValue(combinedText);
                            // Store into map
                            if (cleanContent) {
                                const key = `${currentClass}|${day}|${hour}`;
                                classOriginalTextMap.set(key, cleanContent);
                            }
                        }

                        // Advance main loop index
                        rowIndex = nextIdx - 1;
                    }
                }
            }
        } catch (err) {
            console.error("Error parsing class file:", err);
        }

        // Parse Teacher CSV
        const workbook = XLSX.read(teacherBuffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });

        const scheduleItems: ScheduleItem[] = [];

        // Normalized lookups
        const normalizedTeachers = entities.teachers.map(t => ({ original: t, clean: cleanCSVValue(t) }));
        const normalizedSubjects = entities.subjects.map(s => ({ original: s, clean: cleanCSVValue(s) }));
        const normalizedClasses = entities.classes.map(c => ({ original: c, clean: cleanCSVValue(c) }));
        const normalizedWorkGroups = entities.workGroups.map(w => ({ original: w, clean: cleanCSVValue(w) }));

        // State Machine Variables
        let currentTeacher: string | null = null;
        let dayMap: Record<number, number> | null = null; // ColIndex -> Day
        let hourColIndex: number = -1;

        // Regex helpers
        const TEACHER_TITLE_REGEX = /מערכת שעות למורה|למורה/i;
        const DAY_HEADERS: Record<string, number> = { "ראשון": 1, "שני": 2, "שלישי": 3, "רביעי": 4, "חמישי": 5, "שישי": 6 };

        for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
            const row = rows[rowIndex];
            if (!row || row.length === 0) continue;

            // 1. Detect Teacher Block Start
            const titleMatch = row.find(cell => typeof cell === 'string' && TEACHER_TITLE_REGEX.test(cell));
            if (titleMatch) {
                const cleanTitle = cleanCSVValue(titleMatch.replace(TEACHER_TITLE_REGEX, ''));

                // Always reset state when a new teacher block is detected
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

            // 3. Extract Lesson Data (Multi-Row Support for Merged Cells)
            if (currentTeacher && dayMap) {
                let hour = 0;
                let hourCell: any = null;

                // Try explicit column first
                if (hourColIndex !== -1) {
                    hourCell = row[hourColIndex];
                }

                // Fallback: Check first and last column if explicit failed or empty
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

                // If we found a valid hour, collect all rows for this hour
                if (hour > 0 && hour <= 12) {
                    // Collect rows: current row + subsequent rows without hour number
                    const hourRows = [row];
                    let nextIdx = rowIndex + 1;

                    while (nextIdx < rows.length) {
                        const nextRow = rows[nextIdx];
                        if (!nextRow) break;

                        // Check if next row has a new hour
                        let hasNewHour = false;
                        if (hourColIndex !== -1 && nextRow[hourColIndex]) {
                            const nextHourCell = nextRow[hourColIndex];
                            if (typeof nextHourCell === 'number' ||
                                (typeof nextHourCell === 'string' && /^\d+/.test(nextHourCell))) {
                                hasNewHour = true;
                            }
                        }

                        // Check if next row contains a teacher title (Stop consuming!)
                        const isNextTitle = nextRow.some((c: any) => typeof c === 'string' && TEACHER_TITLE_REGEX.test(c));

                        if (hasNewHour || isNextTitle) break;

                        hourRows.push(nextRow);
                        nextIdx++;
                    }

                    // Process each day column
                    for (const [colIdxStr, day] of Object.entries(dayMap)) {
                        const colIdx = parseInt(colIdxStr);

                        // Combine all cells from this column across all hour rows
                        let combinedText = "";
                        for (const hourRow of hourRows) {
                            const cell = hourRow[colIdx];
                            if (cell && typeof cell === 'string' && cell.trim().length > 0) {
                                combinedText += " " + cell;
                            }
                        }

                        // Skip if column is empty or contains only whitespace
                        const trimmed = combinedText.trim();
                        if (trimmed.length === 0 || /^[\s\u00A0]+$/.test(trimmed)) {
                            continue;
                        }

                        const cleanContent = cleanCSVValue(combinedText);

                        let finalSub = "";
                        let finalCls = "";

                        // 1. Search for WorkGroup (Priority 1)
                        const wgMatch = normalizedWorkGroups
                            .filter(w => cleanContent.includes(w.clean))
                            .sort((a, b) => b.clean.length - a.clean.length)[0];

                        if (wgMatch) {
                            finalSub = wgMatch.original;
                            finalCls = "קבוצה";
                        } else {
                            // 2. Search for Subject (Priority 2)
                            const subMatch = normalizedSubjects
                                .filter(s => cleanContent.includes(s.clean))
                                .sort((a, b) => b.clean.length - a.clean.length)[0];

                            if (subMatch) {
                                finalSub = subMatch.original;
                            }

                            // 3. Search for Class
                            const clsMatch = normalizedClasses
                                .filter(c => cleanContent.includes(c.clean))
                                .sort((a, b) => b.clean.length - a.clean.length)[0];

                            if (clsMatch) {
                                finalCls = clsMatch.original;
                            }
                        }

                        if (finalSub || finalCls) {
                            // Try to find the ORIGINAL TEXT from the CLASS FILE
                            // Key: `ClassName|Day|Hour`
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
                                originalText: classFileOriginalText || cleanContent // Prefer Class File Text if found
                            });
                        }
                    }

                    // Skip the rows we already processed
                    rowIndex = nextIdx - 1;
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
            message: `Successfully constructed schedule with ${scheduleItems.length} lessons.`
        };

    } catch (error) {
        console.error("Error in fullSchedulePreviewAction:", error);
        const err = error as Error;
        return {
            success: false,
            message: `Schedule generation failed: ${err.message}`
        };
    }
};
