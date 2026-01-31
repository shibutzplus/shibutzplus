"use server";

import { checkAuthAndParams } from "@/utils/authUtils";
import { dbLog } from "@/services/loggerService";

type CsvAnalysisConfig = {
    teacherNameRow: number; // 1-based
    headerRow: number; // 1-based
    dataStartRow: number; // 1-based
    separator: "empty_line" | string;
    ignoreText?: string;
    hourColumn?: number; // 1-based
};

type PreviewResponse = {
    success: boolean;
    message: string;
    data?: {
        teachers: string[];
        classes: string[];
        subjects: string[];
    };
    error?: any;
};

export async function previewAnnualScheduleImportAction(
    schoolId: string,
    csvData: string[][],
    config: CsvAnalysisConfig
): Promise<PreviewResponse> {
    try {
        const authError = await checkAuthAndParams({ schoolId });
        if (authError) return authError as PreviewResponse;

        if (!csvData || csvData.length === 0) {
            return { success: false, message: "נתונים ריקים" };
        }

        const teachers = new Set<string>();
        const classes = new Set<string>();
        const subjects = new Set<string>();

        // --- Parsing Logic (Duplicated from Import Action for now) ---
        // TODO: Refactor shared logic to helper

        // Split into blocks
        const blocks: string[][][] = [];
        let currentBlock: string[][] = [];

        for (let i = 0; i < csvData.length; i++) {
            const row = csvData[i];
            const isEmpty = row.every(cell => !cell || !cell.trim());
            const isSeparator = config.separator === "empty_line"
                ? isEmpty
                : row.some(cell => cell.includes(config.separator));

            if (isSeparator) {
                if (currentBlock.length > 0) {
                    blocks.push(currentBlock);
                    currentBlock = [];
                }
            } else {
                currentBlock.push(row);
            }
        }
        if (currentBlock.length > 0) blocks.push(currentBlock);

        // Process blocks
        for (const block of blocks) {
            if (block.length < config.dataStartRow) continue;

            // 1. Get Teacher
            const teacherRowIdx = config.teacherNameRow - 1;
            if (!block[teacherRowIdx]) continue;

            const teacherRowCells = block[teacherRowIdx];
            let teacherName = teacherRowCells.find(c => c && c.trim().length > 0) || "";

            // Clean Teacher Name
            if (config.ignoreText && config.ignoreText.trim().length > 0) {
                teacherName = teacherName.replace(config.ignoreText, "").trim();
            }
            teacherName = teacherName.replace("למורה", "").replace(":", "").trim();

            if (teacherName) {
                teachers.add(teacherName);
            }

            // 2. Parse Data for Classes and Subjects
            const startIdx = config.dataStartRow - 1;

            for (let r = startIdx; r < block.length; r++) {
                const row = block[r];
                for (let c = 0; c < row.length; c++) {
                    // Skip hour column
                    if (config.hourColumn && (c + 1) === config.hourColumn) continue;

                    const cell = row[c];
                    if (!cell || !cell.trim()) continue;
                    const content = cell.trim();

                    // HEURISTIC: content with digits is likely a Class (e.g. "Aleph 1", "Grade 10")
                    if (/\d/.test(content)) {
                        classes.add(content);
                    } else {
                        // Otherwise it's likely a subject
                        subjects.add(content);
                    }
                }
            }
        }

        return {
            success: true,
            message: "עיבוד נתונים ראשוני הושלם",
            data: {
                teachers: Array.from(teachers).sort(),
                classes: Array.from(classes).sort(),
                subjects: Array.from(subjects).sort(),
            }
        };

    } catch (error: any) {
        dbLog({ description: `Preview error: ${error instanceof Error ? error.message : String(error)}`, schoolId });
        return { success: false, message: "שגיאה בניתוח הנתונים", error: error.message };
    }
}
