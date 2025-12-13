export type CsvAnalysisConfig = {
    teacherNameRow: number; // 1-based (treated as Class Name Row in class import)
    headerRow: number; // 1-based
    dataStartRow: number; // 1-based
    separator: "empty_line" | string;
    ignoreText?: string;
    hourColumn?: number; // 1-based
    // New Subject Extraction Params
    subjectLine?: "first" | "last" | "all";
    subjectSeparator?: string;
};

/**
 * Parses raw CSV data into "blocks" based on the separator configuration.
 * Each block represents a schedule unit (e.g., a Teacher's schedule or a Class's schedule).
 */
export function parseCsvToBlocks(csvData: string[][], config: CsvAnalysisConfig): string[][][] {
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

    return blocks;
}

/**
 * Extracts and cleans the name from a specific row in a block.
 */
export function extractNameFromBlock(block: string[][], config: CsvAnalysisConfig): string | null {
    // 1. Get Name Row
    // teacherNameRow is 1-based index
    const nameRowIdx = config.teacherNameRow - 1;
    if (!block[nameRowIdx]) return null;

    const nameRowCells = block[nameRowIdx];
    // Find first non-empty cell
    let name = nameRowCells.find(c => c && c.trim().length > 0) || "";

    // 2. Cleanup
    if (config.ignoreText && config.ignoreText.trim().length > 0) {
        name = name.replace(config.ignoreText, "").trim();
    }

    // Common cleanup
    name = name.replace("למורה", "").replace(":", "").trim();

    return name || null;
}

/**
 * Extracts potential subjects from the data grid area of all blocks.
 * Logic: Iterate all cells in data area.
 *  - Split cell into lines.
 *  - Use config.subjectLine to pick lines ("first" (default), "last", "all").
 *  - Split chosen lines by config.subjectSeparator (default ",").
 */
export function extractSubjectsFromGrid(blocks: string[][][], config: CsvAnalysisConfig): { subjects: Set<string>, workGroups: Set<string> } {
    const subjects = new Set<string>();
    const workGroups = new Set<string>();

    const excludedSubjects = new Set([
        "פרטני", "מליאה", "שהייה", "תפקיד", "ייעוץ",
        "ניהול", "שילוב", "תגבור", "צוות"
    ]);

    const lineMode = config.subjectLine || "first";
    const separator = config.subjectSeparator || ",";

    for (const block of blocks) {
        if (block.length < config.dataStartRow) continue;

        // Iterate data rows
        const startIdx = config.dataStartRow - 1;
        for (let r = startIdx; r < block.length; r++) {
            const row = block[r];
            for (let c = 0; c < row.length; c++) {
                // Skip hour column
                if (config.hourColumn && (c + 1) === config.hourColumn) continue;

                const cell = row[c];
                if (!cell || !cell.trim()) continue;

                // Split by newline
                const lines = cell.split("\n").map(l => l.trim()).filter(l => l.length > 0);
                if (lines.length === 0) continue;

                let linesToProcess: string[] = [];
                if (lineMode === "first") {
                    linesToProcess = [lines[0]];
                } else if (lineMode === "last") {
                    linesToProcess = [lines[lines.length - 1]];
                } else { // "all"
                    linesToProcess = lines;
                }

                for (const line of linesToProcess) {
                    // Split by separator
                    const lineParts = line.split(separator).map(p => p.trim());

                    for (const candidate of lineParts) {
                        if (candidate.length <= 1) continue;

                        // Check if candidate includes ANY excluded keyword
                        // Convert Set to Array for .some()
                        const keywordMatch = Array.from(excludedSubjects).some(kw => candidate.includes(kw));

                        if (keywordMatch) {
                            workGroups.add(candidate);
                        } else {
                            subjects.add(candidate);
                        }
                    }
                }
            }
        }
    }
    return { subjects, workGroups };
}
