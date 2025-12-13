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

/**
 * Calculates the similarity percentage between two strings.
 * Uses Levenshtein distance.
 * Returns a number between 0 and 100.
 */
export function calculateSimilarity(s1: string, s2: string): number {
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;

    if (longer.length === 0) {
        return 1.0;
    }

    const editDistance = levenshtein(longer, shorter);
    return (longer.length - editDistance) / longer.length * 100;
}

function levenshtein(s1: string, s2: string): number {
    const costs: number[] = new Array();
    for (let i = 0; i <= s1.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= s2.length; j++) {
            if (i == 0)
                costs[j] = j;
            else {
                if (j > 0) {
                    let newValue = costs[j - 1];
                    if (s1.charAt(i - 1) != s2.charAt(j - 1))
                        newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
        }
        if (i > 0)
            costs[s2.length] = lastValue;
    }
    return costs[s2.length];
}

/**
 * Finds the best match for a query string from a list of candidates.
 * Returns the candidate and the score if above threshold.
 */
export function findBestMatch(query: string, candidates: string[], threshold: number = 90): { bestMatch: string | null, score: number } {
    let bestMatch: string | null = null;
    let bestScore = 0;

    const normalizedQuery = query.trim();

    for (const candidate of candidates) {
        // Direct inclusion check (bonus)
        // If DB name is subset of CSV name or vice versa, give high score?
        // Requirement says: "DB name can be subset of CSV name".
        // e.g. CSV: "John Doe Master" -> DB: "John Doe"
        if (normalizedQuery.includes(candidate) || candidate.includes(normalizedQuery)) {
            // Check length ratio to avoid "Dan" matching "Daniela" too easily if we only rely on includes
            // But usually this is a strong signal. Let's calculate similarity anyway to be safe, 
            // OR give it a boost.
            // Let's rely on similarity but maybe use a lower threshold if it's a substring match?
            // Actually, for "starts with" or "contains", we might want to return immediately if exact match.
        }

        const score = calculateSimilarity(normalizedQuery, candidate);
        if (score > bestScore) {
            bestScore = score;
            bestMatch = candidate;
        }
    }

    if (bestScore >= threshold) {
        return { bestMatch, score: bestScore };
    }

    return { bestMatch: null, score: bestScore };
}
