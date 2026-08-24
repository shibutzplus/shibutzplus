"use server";

import { auth } from "@/auth";
import { dbLog } from "@/services/loggerService";

async function getXLSX() {
    const libName = "xlsx";
    return await import(libName);
}

export interface ExcelExtractResult {
    teachers: string[];
    classes: string[];
    subjects: string[];
    workGroups: string[];
}

function cleanEntityName(raw: string): string {
    let name = raw || "";
    // Remove date/time patterns (e.g. "27/05/2026 10:19:24")
    name = name.replace(/\d{1,2}\/\d{1,2}\/\d{4}\s+\d{1,2}:\d{2}:\d{2}/g, "");
    name = name.replace(/\d{1,2}\/\d{1,2}\/\d{4}/g, "");
    // Remove invisible unicode characters
    name = name.replace(/[\u200B-\u200D\uFEFF]/g, "");
    // Collapse multiple spaces
    name = name.replace(/\s+/g, " ").trim();

    const stopWords = ["הוראה", "שהייה", "שעה", "יום", "פרטני", "תפקיד"];
    for (const stop of stopWords) {
        const idx = name.indexOf(stop);
        if (idx > 0) {
            name = name.slice(0, idx).trim();
        }
    }

    return name.replace(/[,\.]+$/, "").trim();
}

function normalizeSubjectOrGroup(raw: string): string {
    if (!raw) return "";
    let s = raw.trim();
    // Strip wrapping quotes if any
    if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
        s = s.slice(1, -1).trim();
    }
    // Remove (ש) or (פ) or (ש/פ) or [ש] suffixes/annotations
    s = s.replace(/\s*[\(\[]\s*[שפ]\s*[\)\]]/g, "");
    // Replace dots with spaces (e.g. "ארוחת.צהרים" -> "ארוחת צהרים")
    s = s.replace(/\./g, " ");
    // Remove invisible unicode characters
    s = s.replace(/[\u200B-\u200D\uFEFF]/g, "");
    // Normalize Hebrew gershayim and geresh to standard " and '
    s = s.replace(/[\u05F4\u201C\u201D]/g, '"');
    s = s.replace(/[\u05F3\u2018\u2019`´]/g, "'");
    s = s.replace(/\s+/g, " ").trim();
    return s;
}

function cleanForComparison(s: string): string {
    return s.replace(/['"״׳\u05F4\u05F3\u201C\u201D\u2018\u2019]/g, "").replace(/\s+/g, " ").trim();
}

function deduplicateEntities(list: string[]): string[] {
    const normalized = list
        .map(normalizeSubjectOrGroup)
        .filter(s => s && s.length >= 2);

    // Sort by length descending, preferring items that contain standard acronym quotes
    const sorted = Array.from(new Set(normalized)).sort((a, b) => {
        const aHasQuote = a.includes('"') || a.includes("'") ? 1 : 0;
        const bHasQuote = b.includes('"') || b.includes("'") ? 1 : 0;
        if (aHasQuote !== bHasQuote) return bHasQuote - aHasQuote;
        return b.length - a.length;
    });

    const finalSet = new Set<string>();

    sorted.forEach(cand => {
        const cleanCand = cleanForComparison(cand);
        const isTruncatedOfExisting = Array.from(finalSet).some(existing => {
            const cleanExist = cleanForComparison(existing);
            if (cleanExist === cleanCand) return true;
            // Check if cand is a prefix (e.g. "ארוחת צהרי" vs "ארוחת צהרים", "בית ספר מנ" vs "בית ספר מנגן")
            if (cleanExist.startsWith(cleanCand) && cleanCand.length >= 4) return true;
            const candWords = cleanCand.split(" ");
            const existWords = cleanExist.split(" ");
            if (
                candWords.length === existWords.length &&
                candWords.every((w, idx) => existWords[idx].startsWith(w))
            ) {
                return true;
            }
            return false;
        });

        if (!isTruncatedOfExisting) {
            finalSet.add(cand);
        }
    });

    return Array.from(finalSet).sort((a, b) => a.localeCompare(b, "he"));
}

/**
 * Extracts teachers, classes, subjects and workGroups from teacher and class Excel files.
 */
export const extractEntitiesFromExcelAction = async (
    formData: FormData
): Promise<{
    success: boolean;
    message?: string;
    data?: ExcelExtractResult;
}> => {
    let schoolId: string | undefined;

    try {
        const session = await auth();
        if (!session?.user) {
            return { success: false, message: "Not authenticated" };
        }

        const providedSchoolId = formData.get("schoolId") as string | null;
        schoolId = providedSchoolId?.trim() || session.user.schoolId;

        if (!schoolId) {
            return { success: false, message: "No school ID available" };
        }

        const teacherFile = formData.get("teacherFile") as File | null;
        const classFile = formData.get("classFile") as File | null;

        if (!teacherFile || !classFile) {
            return { success: false, message: "Missing Excel files" };
        }

        const [teacherBuffer, classBuffer] = await Promise.all([
            teacherFile.arrayBuffer().then(ab => Buffer.from(ab)),
            classFile.arrayBuffer().then(ab => Buffer.from(ab)),
        ]);

        const XLSX = await getXLSX();
        const teacherWb = XLSX.read(teacherBuffer, { type: "buffer" });
        const classWb = XLSX.read(classBuffer, { type: "buffer" });

        const teachers = new Set<string>();
        const classes = new Set<string>();
        const rawSubjects: string[] = [];
        const rawWorkGroups: string[] = [];

        const TEACHER_TITLE_REGEX = /מערכת שעות\s+(?:ל?מורה|מורה:?)\s+(.+)/i;
        const CLASS_CODE_REGEX = /([א-י][׳']?[\s-]?[1-9][0-9]?|[א-י]["״][א-י][\s-]?[1-9][0-9]?)/;
        const WORKGROUP_KEYWORDS = [
            "שילוב",
            "שהייה",
            "פרטני",
            "צוות",
            "ישיב",
            "ריכוז",
            "השתלמות",
            "ניהול",
            "תפקיד",
            "חלון",
            "הדרכה",
            "הכלה",
            "הוראה מותאמת",
            "מתיא",
            "מתי״א",
            "(ש)",
            "(פ)",
        ];

        // 1. Parse Teacher Sheets
        teacherWb.SheetNames.forEach((sheetName: string) => {
            const sheet = teacherWb.Sheets[sheetName];
            const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

            rows.forEach(row => {
                row.forEach((cell: any) => {
                    if (typeof cell !== "string") return;
                    const trimmed = cell.trim();
                    if (!trimmed) return;

                    // Match Teacher header (e.g. "מערכת שעות למורה אלזס בתיה")
                    if (trimmed.includes("מערכת שעות")) {
                        const match = trimmed.match(TEACHER_TITLE_REGEX);
                        if (match && match[1]) {
                            const name = cleanEntityName(match[1]);
                            if (name && name.length >= 2) {
                                teachers.add(name);
                            }
                        }
                    }

                    // Match cell content (e.g. "מתמטיקה\r\nג1\r\n" or "פרטני\r\n")
                    if (
                        !trimmed.includes("מערכת שעות") &&
                        !trimmed.startsWith("שעור") &&
                        !trimmed.startsWith("שעה") &&
                        !trimmed.startsWith("יום")
                    ) {
                        const lines = trimmed
                            .split(/[\r\n]+/)
                            .map(l => l.replace(/[\u200B-\u200D\uFEFF]/g, "").trim())
                            .filter(Boolean);

                        if (lines.length > 0) {
                            const firstLine = lines[0];
                            const isWg = WORKGROUP_KEYWORDS.some(kw => trimmed.includes(kw));

                            if (isWg) {
                                rawWorkGroups.push(firstLine);
                            } else if (firstLine.length >= 2) {
                                rawSubjects.push(firstLine);
                            }

                            if (lines.length >= 2) {
                                const secondLine = lines[1];
                                const match = secondLine.match(CLASS_CODE_REGEX);
                                if (match && match[1]) {
                                    const code = match[1]
                                        .replace(/['"״׳\u05F4\u05F3\u201C\u201D\u2018\u2019\s]/g, "")
                                        .trim();
                                    if (code) {
                                        classes.add(`כיתה ${code}`);
                                    }
                                }
                            }
                        }
                    }
                });
            });
        });

        // 2. Parse Class Sheets
        classWb.SheetNames.forEach((sheetName: string) => {
            const sheet = classWb.Sheets[sheetName];
            const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

            rows.forEach(row => {
                row.forEach((cell: any) => {
                    if (typeof cell !== "string") return;
                    const trimmed = cell.trim();
                    if (!trimmed) return;

                    // Match Class header (e.g. "מערכת שעות לכיתה א1")
                    if (trimmed.includes("מערכת שעות")) {
                        const match = trimmed.match(CLASS_CODE_REGEX);
                        if (match && match[1]) {
                            const code = match[1]
                                .replace(/['"״׳\u05F4\u05F3\u201C\u201D\u2018\u2019\s]/g, "")
                                .trim();
                            if (code) {
                                classes.add(`כיתה ${code}`);
                            }
                        }
                    }

                    // Match cell content in class file (e.g. "שפה\r\nהדס")
                    if (
                        !trimmed.includes("מערכת שעות") &&
                        !trimmed.startsWith("שעור") &&
                        !trimmed.startsWith("שעה") &&
                        !trimmed.startsWith("יום")
                    ) {
                        const lines = trimmed
                            .split(/[\r\n]+/)
                            .map(l => l.replace(/[\u200B-\u200D\uFEFF]/g, "").trim())
                            .filter(Boolean);

                        if (lines.length >= 1) {
                            const subj = lines[0];
                            if (
                                subj.length >= 2 &&
                                !WORKGROUP_KEYWORDS.some(kw => subj.includes(kw))
                            ) {
                                rawSubjects.push(subj);
                            }
                        }
                    }
                });
            });
        });

        const fileTeachers = Array.from(teachers); // Preserve original order from Excel file
        const sortedClasses = Array.from(classes).sort((a, b) => a.localeCompare(b, "he"));
        const sortedSubjects = deduplicateEntities(rawSubjects);
        const sortedWorkGroups = deduplicateEntities(rawWorkGroups);

        return {
            success: true,
            data: {
                teachers: fileTeachers,
                classes: sortedClasses,
                subjects: sortedSubjects,
                workGroups: sortedWorkGroups,
            },
        };
    } catch (error) {
        const err = error as Error;
        dbLog({
            description: `Error in extractEntitiesFromExcelAction: ${err.message}`,
            schoolId,
        });
        return {
            success: false,
            message: `שגיאה בקריאת קבצי אקסל: ${err.message}`,
        };
    }
};
