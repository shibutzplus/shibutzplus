"use server";

import { auth } from "@/auth";
import { dbLog } from "@/services/loggerService";
import { extractParagraphsFromDocx, normalizeClassCode } from "@/services/importAnnual/docxUtils";

// --- Types ---
export interface WordExtractResult {
    teachers: string[];
    classes: string[];
    subjects: string[];
    workGroups: string[];
}

function extractTeachersFromText(paragraphs: string[]): string[] {
    const teachers = new Set<string>();
    paragraphs.forEach(line => {
        if (line.includes("מערכת שעות")) {
            const match = line.match(/מערכת שעות\s+(?:ל?מורה|מורה:?)\s+(.+)/);
            if (match && match[1]) {
                const cleaned = cleanEntityName(match[1]);
                if (cleaned && cleaned.length >= 2) {
                    teachers.add(cleaned);
                }
            }
        }
    });
    return Array.from(teachers).sort();
}

function extractClassesFromText(paragraphs: string[]): string[] {
    const classes = new Set<string>();
    // Regex matching class grade and number (e.g. א1, א'1, ז3, יא2, י"א 2)
    const CLASS_CODE_REGEX = /([א-י][׳']?[\s-]?[1-9][0-9]?|[א-י]["״][א-י][\s-]?[1-9][0-9]?)/;

    paragraphs.forEach(line => {
        if (line.includes("מערכת שעות")) {
            const match = line.match(CLASS_CODE_REGEX);
            if (match && match[1]) {
                const rawCode = match[1].replace(/['"״׳\u05F4\u05F3\u201C\u201D\u2018\u2019]/g, "").replace(/\s+/g, "").trim();
                if (rawCode) {
                    classes.add(`כיתה ${rawCode}`);
                }
            }
        }
    });
    return Array.from(classes).sort();
}

const WORKGROUP_KEYWORDS = ["שהייה", "פרטני", "צוות", "ישיב", "ריכוז", "השתלמות", "ניהול", "תפקיד", "חלון", "הדרכה"];

/**
 * Extracts subjects and workGroups from both class and teacher schedule files.
 * - Lessons with real classes (e.g. "ב1", "ד3") or "הוראה" are categorized as subjects.
 * - Lessons marked with "קבוצה" or containing presence/staff keywords (שהייה, פרטני, צוות...) are categorized as workGroups.
 */
function extractSubjectsAndWorkGroups(
    classParagraphs: string[],
    teacherParagraphs: string[]
): { subjects: string[]; workGroups: string[] } {
    const subjects = new Set<string>();
    const workGroups = new Set<string>();

    // 1. From Class File: parts[0] are subjects
    classParagraphs.forEach(line => {
        if (line.includes("מערכת שעות")) return;
        const parts = line.split(",").map(p => p.trim());
        if (parts.length >= 2) {
            const rawCandidate = parts[0];
            if (!rawCandidate || rawCandidate.length < 2) return;
            if (rawCandidate.startsWith("יום ") || rawCandidate.startsWith("שעה ")) return;
            const candidate = rawCandidate.replace(/['"״׳\u05F4\u05F3\u201C\u201D\u2018\u2019]/g, "").replace(/\s+/g, " ").trim();
            if (candidate.length >= 2) {
                subjects.add(candidate);
            }
        }
    });

    // 2. From Teacher File:
    teacherParagraphs.forEach(line => {
        if (line.includes("מערכת שעות")) return;
        const parts = line.split(",").map(p => p.trim());
        if (parts.length >= 2) {
            const rawCandidate = parts[0];
            if (!rawCandidate || rawCandidate.length < 2) return;
            if (rawCandidate.startsWith("יום ") || rawCandidate.startsWith("שעה ")) return;
            const candidate = rawCandidate.replace(/['"״׳\u05F4\u05F3\u201C\u201D\u2018\u2019]/g, "").replace(/\s+/g, " ").trim();
            if (candidate.length < 2) return;

            const secondPart = parts[1] || "";
            const hasClassCode = !!normalizeClassCode(secondPart);
            const isExplicitWorkGroup = secondPart === "קבוצה" || WORKGROUP_KEYWORDS.some(kw => candidate.includes(kw) || line.includes(kw));

            if (hasClassCode && !isExplicitWorkGroup) {
                // Real subject taught in class (e.g. "שבילי מורשת, ב1 שירה צדוק, הוראה")
                subjects.add(candidate);
            } else if (isExplicitWorkGroup || secondPart === "קבוצה" || !hasClassCode) {
                if (!subjects.has(candidate)) {
                    workGroups.add(candidate);
                }
            } else {
                if (!subjects.has(candidate)) {
                    workGroups.add(candidate);
                }
            }
        } else if (parts.length === 1) {
            const single = parts[0].replace(/['"״׳\u05F4\u05F3\u201C\u201D\u2018\u2019]/g, "").replace(/\s+/g, " ").trim();
            if (WORKGROUP_KEYWORDS.some(kw => single.includes(kw))) {
                workGroups.add(single);
            }
        }
    });

    return {
        subjects: Array.from(subjects).sort(),
        workGroups: Array.from(workGroups).sort(),
    };
}

/**
 * Cleans an entity name extracted from DOCX:
 * - Strips date/time patterns (DD/MM/YYYY HH:MM:SS)
 * - Stops at structural keywords (שהייה, הוראה, שעה, יום...)
 * - Collapses whitespace
 */
function cleanEntityName(raw: string): string {
    let name = raw;

    // Remove date/time patterns (e.g. "27/05/2026 10:19:24")
    name = name.replace(/\d{1,2}\/\d{1,2}\/\d{4}\s+\d{1,2}:\d{2}:\d{2}/g, "");
    name = name.replace(/\d{1,2}\/\d{1,2}\/\d{4}/g, "");

    // Collapse multiple spaces
    name = name.replace(/\s+/g, " ").trim();

    // Stop at known structural keywords that indicate end of name
    const stopWords = ["הוראה", "שהייה", "שעה", "יום", "פרטני", "תפקיד"];
    for (const stop of stopWords) {
        const idx = name.indexOf(stop);
        if (idx > 0) {
            name = name.slice(0, idx).trim();
        }
    }

    // Remove trailing commas or periods
    name = name.replace(/[,\.]+$/, "").trim();

    return name;
}

// --- Main Server Action ---

/**
 * Extracts teachers, classes, subjects and workGroups from two DOCX Word schedule files.
 *
 * @param formData - teacherWordFile (File), classWordFile (File), schoolId (string)
 */
export const extractEntitiesFromWordAction = async (
    formData: FormData
): Promise<{
    success: boolean;
    message?: string;
    data?: WordExtractResult;
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

        const teacherWordFile = formData.get("teacherWordFile") as File | null;
        const classWordFile = formData.get("classWordFile") as File | null;

        if (!teacherWordFile || !classWordFile) {
            return { success: false, message: "Missing Word files" };
        }

        // Convert Files to Buffers
        const [teacherBuffer, classBuffer] = await Promise.all([
            teacherWordFile.arrayBuffer().then(ab => Buffer.from(ab)),
            classWordFile.arrayBuffer().then(ab => Buffer.from(ab)),
        ]);

        // Extract paragraphs from both DOCX files
        const teacherParagraphs = extractParagraphsFromDocx(teacherBuffer);
        const classParagraphs = extractParagraphsFromDocx(classBuffer);

        dbLog({
            description: `[DEBUG WORD IMPORT] classParagraphs length: ${classParagraphs.length}, first 30: ${JSON.stringify(classParagraphs.slice(0, 30))}`,
            schoolId
        });

        // Extract teachers and classes first
        const teachers = extractTeachersFromText(teacherParagraphs);
        const classes = extractClassesFromText(classParagraphs);

        dbLog({
            description: `[DEBUG WORD IMPORT] extracted teachers: ${teachers.length}, classes: ${classes.length}`,
            schoolId
        });

        // Extract subjects and workGroups from both files
        const { subjects, workGroups } = extractSubjectsAndWorkGroups(
            classParagraphs,
            teacherParagraphs
        );

        dbLog({
            description: `[extractEntitiesFromWordAction] Extracted ${teachers.length} teachers, ${classes.length} classes, ${subjects.length} subjects, ${workGroups.length} workGroups`,
            schoolId,
        });

        return {
            success: true,
            data: { teachers, classes, subjects, workGroups },
        };

    } catch (error) {
        const err = error as Error;
        dbLog({
            description: `Error in extractEntitiesFromWordAction: ${err.message}`,
            schoolId,
        });
        return {
            success: false,
            message: `שגיאה בקריאת קבצי Word: ${err.message}`,
        };
    }
};
