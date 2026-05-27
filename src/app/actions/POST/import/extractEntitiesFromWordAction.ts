"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbLog } from "@/services/loggerService";
import AdmZip from "adm-zip";

// --- Types ---
export interface WordExtractResult {
    teachers: string[];
    classes: string[];
    subjects: string[];
    workGroups: string[];
}

/**
 * Extracts paragraphs from a DOCX file buffer.
 * DOCX is a ZIP archive containing word/document.xml.
 * Uses adm-zip for reliable ZIP parsing.
 */
function extractParagraphsFromDocx(buffer: Buffer): string[] {
    const zip = new AdmZip(buffer);
    const entry = zip.getEntry("word/document.xml");

    if (!entry) {
        throw new Error("word/document.xml not found in DOCX file");
    }

    const xmlContent = entry.getData().toString("utf8");

    const paragraphs: string[] = [];
    // Match each <w:p> element
    const wpRegex = /<w:p(?:\s[^>]*)?>([\s\S]*?)<\/w:p>/g;
    let wpMatch;
    while ((wpMatch = wpRegex.exec(xmlContent)) !== null) {
        const pContent = wpMatch[1];
        // In each paragraph, match all <w:t> elements
        const wtRegex = /<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g;
        let wtMatch;
        const textParts: string[] = [];
        while ((wtMatch = wtRegex.exec(pContent)) !== null) {
            textParts.push(wtMatch[1]);
        }
        const pText = textParts.join("").trim();
        if (pText) {
            paragraphs.push(pText);
        }
    }

    return paragraphs;
}

/**
 * Parses paragraphs from a teacher DOCX to extract teacher names.
 */
function extractTeachersFromText(paragraphs: string[]): string[] {
    const teachers = new Set<string>();
    paragraphs.forEach(line => {
        if (line.includes("מערכת שעות מורה")) {
            const name = line.replace(/מערכת שעות\s+מורה\s+/, "").trim();
            const cleaned = cleanEntityName(name);
            if (cleaned && cleaned.length >= 2) {
                teachers.add(cleaned);
            }
        }
    });
    return Array.from(teachers).sort();
}

/**
 * Parses paragraphs from a class DOCX to extract class names.
 */
function extractClassesFromText(paragraphs: string[]): string[] {
    const classes = new Set<string>();
    paragraphs.forEach(line => {
        if (line.includes("מערכת שעות כיתה")) {
            const name = line.replace(/מערכת שעות\s+כיתה\s+/, "").trim();
            const cleaned = cleanEntityName(name);
            if (cleaned && cleaned.length >= 2) {
                classes.add(cleaned);
            }
        }
    });
    return Array.from(classes).sort();
}

/**
 * Extracts subjects only from the class schedule file.
 */
function extractSubjectsFromText(
    classParagraphs: string[]
): string[] {
    const subjects = new Set<string>();

    classParagraphs.forEach(line => {
        const parts = line.split(",").map(p => p.trim());
        if (parts.length >= 2) {
            const candidate = parts[0];
            if (!candidate || candidate.trim().length < 2) return;

            subjects.add(candidate);
        }
    });

    return Array.from(subjects).sort();
}

/**
 * Extracts workGroups only from teachers file.
 */
function extractWorkGroupsFromText(
    teacherParagraphs: string[],
    teachers: string[],
    classes: string[],
    identifiedSubjects: Set<string>
): string[] {
    const workGroups = new Set<string>();

    teacherParagraphs.forEach(line => {
        const parts = line.split(",").map(p => p.trim());
        if (parts.length >= 2) {
            const candidate = parts[0];
            if (!candidate || candidate.trim().length < 2) return;

            // If it's not in the identified subjects list, it's a workGroup
            if (!identifiedSubjects.has(candidate)) {
                workGroups.add(candidate);
            }
        }
    });

    return Array.from(workGroups).sort();
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
        const session = await getServerSession(authOptions);
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

        // Extract subjects and workGroups using separate functions
        const subjects = extractSubjectsFromText(
            classParagraphs
        );
        const workGroups = extractWorkGroupsFromText(
            teacherParagraphs,
            teachers,
            classes,
            new Set(subjects)
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
