import { geminiService } from "@/services/geminiService";
import * as XLSX from 'xlsx';
import { dbLog } from "@/services/loggerService";

export const importAnnualService = {

    /**
     * Extract single entity type (for Refresh functionality)
     */
    extractSingleEntity: async (
        teacherBuffer: Buffer,
        classBuffer: Buffer,
        entityType: 'teachers' | 'classes' | 'subjects' | 'workGroups',
        dynamicKeywords?: string[],
        knownTeachers: string[] = [],
        knownClasses: string[] = [],
        schoolId?: string
    ): Promise<{ success: boolean; data?: { name: string, source: 'ai' | 'manual' }[]; message?: string }> => {
        try {
            let teacherCSV = bufferToCsv(teacherBuffer);
            let classCSV = bufferToCsv(classBuffer);

            // --- CLEANING FUNCTION ---
            const performCleaning = (text: string) => {
                let cleaned = text;
                // Remove Teachers (Sort by length to handle sub-names correctly)
                const sortedTeachers = [...knownTeachers].filter(t => t && t.length > 2).sort((a, b) => b.length - a.length);
                sortedTeachers.forEach(teacher => {
                    // Global replace of the name
                    cleaned = cleaned.split(teacher).join("");
                });

                // Remove Classes
                const sortedClasses = [...knownClasses].filter(c => c && c.length > 1).sort((a, b) => b.length - a.length);
                sortedClasses.forEach(cls => {
                    // Global replace
                    cleaned = cleaned.split(cls).join("");
                });
                return cleaned;
            };

            // Apply Cleaning
            teacherCSV = performCleaning(teacherCSV);
            classCSV = performCleaning(classCSV);

            // --- DEDUPLICATION (New Step) ---
            const CLASS_REGEX = /^[א-י]["']?[1-9][0-9]?$/;

            const getUniqueTokens = (text: string): string => {
                const uniqueSet = new Set<string>();
                // Split by newlines, commas, and slashes to get individual cell parts
                // This mimics the "Candidate" logic but applies it to the content generation
                const parts = text.split(/[\n,]+/).map(p => p.trim());

                parts.forEach(p => {
                    const clean = cleanCSVValue(p);
                    // Filter out pure numbers and class codes using regex
                    if (clean && clean.length >= 2 && !/^\d+$/.test(clean) && !CLASS_REGEX.test(clean.replace(/[()]/g, ''))) {
                        uniqueSet.add(clean);
                    }
                });
                return Array.from(uniqueSet).join("\n");
            };

            const uniqueTeacherCSV = getUniqueTokens(teacherCSV);
            const uniqueClassCSV = getUniqueTokens(classCSV);


            const prompts: Record<string, string> = {
                teachers: `
                    Extract all unique teacher names from the COLUMN HEADERS of the "Teacher CSV File".
                    Headers often contain titles like "מערכת שעות למורה ישראל ישראלי".
                    Target: Extract ONLY the Teacher Name.
                    
                    Rules:
                    1. Remove "מערכת שעות", "למורה", "Schedule for".
                    2. Clean up any extra labels.
                    3. Return ONLY a minified JSON array of strings: ["name1","name2",...]
                    4. CRITICAL: Do NOT invent names. ONLY extract names explicitly present in the file headers.
                    5. STRICTLY NO DUPLICATES. If a name appears multiple times, list it only once.
                    6. SAFETY LIMIT: Return MAXIMUM 100 items. 
                    No whitespace/newlines in JSON. No backticks.
                `,
                classes: `
                    Extract all unique CLASS NAMES from the COLUMN HEADERS of the "Class CSV File".
                    Target: Extract ONLY the short class code (Grade + Number).
                    Examples: 
                    - "מערכת שעות כיתה א'1 אפרודיט" -> Extract "א'1"
                    - "כיתה ז3" -> Extract "ז3"
                    - "יא 2" -> Extract "יא 2"
                    
                    Rules:
                    1. Remove "מערכת שעות", "כיתה".
                    2. Remove Teacher Names (e.g. "אפרודיט", "ישראל ישראלי") that appear after the class code.
                    3. Keep only the Grade letter/name and the class number.
                    4. Return ONLY a minified JSON array of strings: ["א'1","ז3",...]
                    5. CRITICAL: Do NOT invent classes. ONLY extract classes explicitly present in the file headers.
                    6. STRICTLY NO DUPLICATES. List each class code only once.
                    7. SAFETY LIMIT: Return MAXIMUM 60 items. 
                    No whitespace/newlines in JSON. No backticks.
                `,

            };

            // --- Step 1: Candidate Collection (The "Smart Sieve") ---
            // Instead of sending the raw CSV (which causes infinite loops), we collect unique phrases first.
            const candidates = new Set<string>();
            const manualItems = new Set<string>(); // Keep track of dictionary matches
            // NOTE: We might skip this step if we are already sending condensed unique content. 
            // But let's keep it for now as it also does Dictionary matching which is unrelated to deduplication.

            if (entityType === 'workGroups' || entityType === 'subjects') {
                const keywordsToCheck = (dynamicKeywords || []).sort();
                /* 
                   We can now run this on the UNIQUE content to save time, 
                   but strictly speaking, the buffer scan was deeper. 
                   Let's leave this part mostly as is, but maybe skip the buffer scan if we trust our unique token set?
                   Actually, let's keep the buffer scan for now to ensure we don't break "Manual Item" detection
                   which might rely on specific context or just being safe.
                   For now, I'll focusing on what WE SEND TO AI (Step 2).
                */
                // ... (Keep existing buffer scan logic if desired, or assume uniqueTeacherCSV covers it)
                // To minimize changes and risks, I will keep the buffer scan logic as is for now.
                // It just builds the 'candidates' set which we might use later or just for logging.

                const buffersToScan: Buffer[] = [];
                if (entityType === 'workGroups') buffersToScan.push(teacherBuffer);
                else buffersToScan.push(teacherBuffer, classBuffer); // subjects

                buffersToScan.forEach(buffer => {
                    const workbook = XLSX.read(buffer, { type: 'buffer' });
                    const sheet = workbook.Sheets[workbook.SheetNames[0]];
                    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as string[][];

                    // WorkGroups / Subjects Strategy: Scan Content Rows
                    for (let rowIndex = 1; rowIndex < rows.length; rowIndex++) {
                        const row = rows[rowIndex];
                        if (!row) continue;
                        for (let colIndex = 1; colIndex < row.length; colIndex++) {
                            const cell = row[colIndex];
                            if (typeof cell === 'string') {

                                // Yes, let's clean the cell before Candidate Analysis
                                const cleanCell = performCleaning(cell);

                                const parts = cleanCell.split(/[\n\/+]+/).map(l => l.trim()).filter(l => l.length >= 2);
                                parts.forEach(part => {
                                    const cleanPart = cleanCSVValue(part);
                                    if (!cleanPart || cleanPart.length < 2) return;

                                    // Filter out pure numbers and class codes
                                    if (/^\d+$/.test(cleanPart)) return;
                                    if (CLASS_REGEX.test(cleanPart.replace(/[()]/g, ''))) return;

                                    // Add to AI candidates
                                    candidates.add(cleanPart);

                                    // Check Dictionary Match
                                    for (const kw of keywordsToCheck) {
                                        if (cleanPart.includes(kw)) {
                                            if (entityType === 'subjects') {
                                                manualItems.add(kw); // Specificity handled in Merge step
                                            } else {
                                                manualItems.add(cleanPart);
                                            }
                                            break;
                                        }
                                    }
                                });
                            }
                        }
                    }
                });
            }

            // --- Step 2: Prepare AI Prompt ---
            const filesToSend: { name: string, content: string }[] = [];

            if (entityType === 'teachers') {
                filesToSend.push({ name: "Teacher CSV File", content: teacherCSV }); // Headers needed, keep full? Or unique? Headers are distinct. unique is fine too but headers have context.
            } else if (entityType === 'classes') {
                filesToSend.push({ name: "Class CSV File", content: classCSV });
            } else if (entityType === 'workGroups') {
                // Use UNIQUE content for WorkGroups
                filesToSend.push({ name: "Teacher CSV Content (Unique)", content: uniqueTeacherCSV });
            } else if (entityType === 'subjects') {
                // Use UNIQUE content for Subjects
                filesToSend.push({ name: "Teacher CSV Content (Unique)", content: uniqueTeacherCSV });
                filesToSend.push({ name: "Class CSV Content (Unique)", content: uniqueClassCSV });
            }

            // Prompts (in case of manual mode and then AI mode)
            if (entityType === 'workGroups') {
                prompts.workGroups = `
                    Analyze the provided list of text tokens (extracted from the schedule file).
                    Target: Identify and extract unique Work Group names.
                    
                    NOTE: The following keywords have already been extracted manually. 
                    CRITICAL: Focus on finding items NOT in this list (or compound variations):
                    [${(dynamicKeywords || []).join(", ")}]
                    
                    LOOK FOR: 
                    1. Special assignments or groups (e.g. "ישיבה", "תורנות", "רוחב", "צוות").
                    2. Any valid Work Group that was missed by the manual keyword search.
                    
                    Rules:
                    1. FILTER OUT Teacher names, Room names, and Class codes.
                    2. DEDUPLICATE the list. 
                    3. Return ONLY a minified JSON array of strings: ["group1","group2",...]
                    4. If no items found, return empty array [].
                    No whitespace/newlines in JSON. No backticks.
                `;
            } else if (entityType === 'subjects') {
                prompts.subjects = `
                    Analyze the provided list of text tokens (extracted from the schedule files).
                    Target: Identify and extract ONLY valid academic SUBJECT NAMES.
                    
                    Known subjects/Keywords (IGNORE *exact matches* only): [${(dynamicKeywords || []).join(", ")}]
                    
                    Target examples: "מתמטיקה", "אנגלית", "חנ\"ג", "תנ\"ך", "אשכול בחירה", "סייבר".
                    
                    Rules:
                    1. FILTER OUT Teacher names, Room names, and Class codes.
                    2. Split combined subjects if they are clearly distinct entities stuck together.
                    3. KEEP short acronyms exactly as they appear (e.g. "חנ\"ג", "תנ\"ך").
                    4. CRITICAL: Extract compound names even if they contain a known subject.
                       - "NLP Theater" -> EXTRACT (even if "NLP" is ignored).
                       - "Spoken English" -> EXTRACT (even if "English" is ignored).
                    5. Return ONLY a minified JSON array of strings: ["subject1", "subject2"]
                    6. CRITICAL: Output the text EXACTLY as it appears. Do NOT reverse Hebrew.
                    No whitespace/newlines in JSON. No backticks.
                `;
            }

            let parsed: string[] = [];

            // AI Extraction (All entities)
            const result = await geminiService.generateAIResponse(
                prompts[entityType],
                filesToSend
            );

            if (!result.success || !result.text) {
                return { success: false, message: result.error || "Extraction failed" };
            }

            try {
                const cleanedText = cleanJsonString(result.text);
                parsed = JSON.parse(cleanedText);
            } catch (err) {
                const error = err as Error;
                dbLog({ description: `[extractSingleEntity] JSON Parse Error: ${error.message}`, schoolId });
                return { success: false, message: `שגיאה בקבלת תוצאות, נסו שוב: ${error.message}` };
            }

            const rawAiItems = Array.isArray(parsed) ? parsed : [];
            const finalResult: { name: string, source: 'ai' | 'manual' }[] = [];
            const seen = new Set<string>();

            // Process AI Items
            rawAiItems.forEach(item => {
                if (typeof item !== 'string') return;
                const subParts = entityType === 'subjects' ? item.split('/') : [item];
                subParts.forEach(p => {
                    const clean = cleanCSVValue(p);
                    if (clean && !seen.has(clean)) {
                        seen.add(clean);
                        finalResult.push({ name: clean, source: 'ai' });
                    }
                });
            });

            // Process Manual Items
            manualItems.forEach(mi => {
                const clean = cleanCSVValue(mi);
                if (clean && !seen.has(clean)) {
                    // Specificity Filter: Don't add manual item if it's a subset of an AI item (e.g. "NLP" vs "NLP תיאטרון")
                    const isRedundant = Array.from(seen).some(found => found.includes(clean) && found !== clean);
                    if (!isRedundant) {
                        seen.add(clean);
                        finalResult.push({ name: clean, source: 'manual' });
                    }
                }
            });

            return { success: true, data: finalResult.slice(0, 100) };

        } catch (error) {
            const err = error as Error;
            dbLog({ description: `Error in extractSingleEntity: ${err.message}`, schoolId });
            return { success: false, message: err.message };
        }
    },

};

//
// --- Helpers ---
//
function bufferToCsv(buffer: Buffer): string {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const csv = XLSX.utils.sheet_to_csv(sheet);

    // Cleanup: Remove empty rows and metadata rows
    return csv
        .split('\n')
        .map(line => line.trim())
        .filter(line => {
            // 1. Remove empty lines
            if (!line) return false;

            // 2. Remove lines with only commas (e.g. ",,,,,,")
            if (/^,+$/.test(line)) return false;

            // 3. Remove metadata lines containing date (e.g. "8/25/25 19:23")
            // Matches M/D/YY H:mm or similar variations anywhere in the line
            if (/\d{1,2}\/\d{1,2}\/\d{2,4}\s+\d{1,2}:\d{2}/.test(line)) return false;

            return true;
        })
        .join('\n');
}

function cleanJsonString(text: string): string {
    let jsonStr = text.trim();
    const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (codeBlockMatch) {
        jsonStr = codeBlockMatch[1];
    }
    return jsonStr;
}

function cleanCSVValue(val: string): string {
    let clean = val.trim();
    // Remove trailing quote if it looks like a CSV artifact (e.g. "תנ"ך"")
    // Note: We only do this if it STARTS with a quote too, to avoid breaking Hebrew acronyms
    if (clean.startsWith('"') && clean.endsWith('"') && clean.length > 2) {
        clean = clean.slice(1, -1);
    }

    // Unescape double quotes (Standard CSV: "" -> ")
    clean = clean.replace(/""/g, '"');
    return clean.trim();
}


