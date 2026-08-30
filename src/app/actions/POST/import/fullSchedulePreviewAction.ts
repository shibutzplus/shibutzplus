"use server";

import { dbLog } from "@/services/loggerService";
import { extractParagraphsFromDocx, normalizeClassCode } from "@/services/importAnnual/docxUtils";

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

        const teacherWordFile = formData.get("teacherWordFile") as File | null;

        const aliasesStr = formData.get("aliases") as string | null;
        const aliases: Record<string, string> = aliasesStr ? JSON.parse(aliasesStr) : {};

        if (!teacherWordFile) {
            return { success: false, message: "חסר קובץ מערכת שעות מורים (Word)" };
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
        const teacherBuffer = await teacherWordFile.arrayBuffer().then(ab => Buffer.from(ab));
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

                            // Match work groups or subjects
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
                            // Single part on line
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

    } catch (error) {
        const err = error as Error;
        dbLog({ description: `Schedule generation failed: ${err.message}`, schoolId });
        return {
            success: false,
            message: `Schedule generation failed: ${err.message}`
        };
    }
};
