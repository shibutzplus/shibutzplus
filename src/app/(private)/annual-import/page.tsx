"use client";

import React, { useState, useRef } from "react";
import Papa, { ParseResult } from "papaparse";
import AnnualImportPageLayout from "@/components/layout/pageLayouts/AnnualImportPageLayout/AnnualImportPageLayout";
import SubmitBtn from "@/components/ui/buttons/SubmitBtn/SubmitBtn";
import InputText from "@/components/ui/inputs/InputText/InputText";
import DynamicInputSelect from "@/components/ui/select/InputSelect/DynamicInputSelect";
import styles from "./page.module.css";
import { useOptionalMainContext } from "@/context/MainContext";
import { errorToast, successToast } from "@/lib/toast";
import { parseCsvToBlocks, extractSubjectsFromGrid } from "@/utils/importUtils";

type CsvAnalysisConfig = {
    teacherNameRow: number;
    headerRow: number;
    dataStartRow: number;
    separator: "empty_line" | string;
    ignoreText: string;
    hourColumn?: number;
};

// Default separator options
const separatorOptions = [
    { value: "empty_line", label: "שורה ריקה" },
    { value: "custom", label: "תו מותאם אישית" },
];

const AnnualImportPage = () => {
    // 1-3: Teachers, 4-6: Classes
    const [step, setStep] = useState(1);

    // --- Teachers State ---
    const [teacherFile, setTeacherFile] = useState<File | null>(null);
    const [teacherCsvData, setTeacherCsvData] = useState<string[][]>([]);
    const [configTeacher, setConfigTeacher] = useState<CsvAnalysisConfig>({
        teacherNameRow: 1,
        headerRow: 2,
        dataStartRow: 3,
        separator: "empty_line",
        ignoreText: "",
    });
    const [previewTeachers, setPreviewTeachers] = useState<string[]>([]);

    // --- Classes State ---
    const [classFile, setClassFile] = useState<File | null>(null);
    const [classCsvData, setClassCsvData] = useState<string[][]>([]);
    const [configClass, setConfigClass] = useState<CsvAnalysisConfig>({
        teacherNameRow: 1, // Interpreted as Class Name Row
        headerRow: 2,
        dataStartRow: 3,
        separator: "empty_line",
        ignoreText: "",
    });
    const [previewClasses, setPreviewClasses] = useState<string[]>([]);

    // --- Subjects State (Step 7) ---
    const [previewSubjects, setPreviewSubjects] = useState<string[]>([]);
    const [previewWorkGroups, setPreviewWorkGroups] = useState<string[]>([]);

    const [customSeparator, setCustomSeparator] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const teacherFileInputRef = useRef<HTMLInputElement>(null);
    const classFileInputRef = useRef<HTMLInputElement>(null);
    const context = useOptionalMainContext();
    const schoolId = context?.school?.id;

    const reset = () => {
        setTeacherFile(null);
        setClassFile(null);
        setTeacherCsvData([]);
        setClassCsvData([]);
        setStep(1);
        setPreviewTeachers([]);
        setPreviewClasses([]);
        setPreviewSubjects([]);
        setPreviewWorkGroups([]);
        if (teacherFileInputRef.current) teacherFileInputRef.current.value = "";
        if (classFileInputRef.current) classFileInputRef.current.value = "";
    };

    const detectStructure = (data: string[][]) => {
        let teacherRow = 1;
        let headerRow = 2;
        let dataRow = 3;
        let ignoreText = "";
        let hourColumn: number | undefined = undefined;

        // Try to find "למורה" or similar
        const teacherIdx = data.findIndex(row => row.some(cell => cell.includes("למורה")));
        if (teacherIdx !== -1) {
            teacherRow = teacherIdx + 1;

            // Heuristic for ignoreText
            const row = data[teacherIdx];
            const cell = row.find(c => c.includes("למורה"));
            if (cell) {
                const commonPrefixes = ["מערכת שעות", "בית ספר"];
                for (const p of commonPrefixes) {
                    if (cell.includes(p)) {
                        ignoreText = p;
                        break;
                    }
                }
            }
        }

        // Try to find header
        const headerIdx = data.findIndex((row, idx) => {
            if (idx < teacherIdx) return false;
            let matches = 0;
            const keywords = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שעה"];
            const rowStr = row.join(" ");
            for (const kw of keywords) {
                if (rowStr.includes(kw)) matches++;
            }
            return matches >= 2;
        });

        if (headerIdx !== -1) {
            headerRow = headerIdx + 1;
            dataRow = headerRow + 1;

            const row = data[headerIdx];
            const hourColIdx = row.findIndex(c => c.includes("שעה"));
            if (hourColIdx !== -1) {
                hourColumn = hourColIdx + 1;
            }
        }

        return {
            teacherNameRow: teacherRow, // or Class Name Row
            headerRow: headerRow,
            dataStartRow: dataRow,
            separator: "empty_line" as const,
            ignoreText,
            hourColumn,
        };
    };

    const handleTeacherFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        setTeacherFile(selectedFile);
        setIsLoading(true);

        Papa.parse(selectedFile, {
            preview: 50,
            complete: (results: ParseResult<string[]>) => {
                const data = results.data;
                setTeacherCsvData(data);
                const detected = detectStructure(data);
                setConfigTeacher(detected);
                setIsLoading(false);
            },
            error: (err) => {
                console.error(err);
                setIsLoading(false);
            }
        });
    };

    const handleClassFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        setClassFile(selectedFile);
        setIsLoading(true);

        Papa.parse(selectedFile, {
            preview: 50,
            complete: (results: ParseResult<string[]>) => {
                const data = results.data;
                setClassCsvData(data);
                const detected = detectStructure(data);
                setConfigClass(detected);
                setIsLoading(false);
            },
            error: (err) => {
                console.error(err);
                setIsLoading(false);
            }
        });
    };

    const handleConfigTeacherChange = (key: keyof CsvAnalysisConfig, value: any) => {
        setConfigTeacher(prev => ({ ...prev, [key]: value }));
    };

    const handleConfigClassChange = (key: keyof CsvAnalysisConfig, value: any) => {
        setConfigClass(prev => ({ ...prev, [key]: value }));
    };

    // Analyze CSV for Teacher or Class List
    const handleAnalyze = async (analyzeStep: 2 | 5) => {
        if (!schoolId) return;
        setIsLoading(true);

        let fileToParse = analyzeStep === 2 ? teacherFile : classFile;

        if (fileToParse) {
            Papa.parse(fileToParse, {
                complete: async (results: ParseResult<string[]>) => {
                    const fullData = results.data;
                    if (analyzeStep === 2) setTeacherCsvData(fullData);
                    else setClassCsvData(fullData);

                    const { previewAnnualScheduleImportAction } = await import("@/app/actions/POST/previewAnnualScheduleImportAction");

                    const configToUse = analyzeStep === 2 ? configTeacher : configClass;
                    const res = await previewAnnualScheduleImportAction(schoolId, fullData, configToUse);

                    if (res.success && res.data) {
                        if (analyzeStep === 2) {
                            setPreviewTeachers(res.data.teachers);
                            setStep(3);
                        } else {
                            setPreviewClasses(res.data.teachers);
                            setStep(6);
                        }
                    } else {
                        alert(res.message);
                    }
                    setIsLoading(false);
                },
                error: (err) => {
                    console.error(err);
                    setIsLoading(false);
                }
            });
        }
    };


    const handleSaveTeachers = async () => {
        if (!schoolId) return;
        setIsLoading(true);
        try {
            const { importAnnualScheduleAction } = await import("@/app/actions/POST/importAnnualScheduleAction");
            const res = await importAnnualScheduleAction(schoolId, teacherCsvData, configTeacher, "teachers");

            if (res.success) {
                successToast(res.message);
                // Stay on step, let "Next" handle nav
            } else {
                errorToast(res.message);
            }
        } catch (err) {
            console.error(err);
            errorToast("Error saving teachers");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveClasses = async () => {
        if (!schoolId) return;
        setIsLoading(true);
        try {
            const { importAnnualScheduleAction } = await import("@/app/actions/POST/importAnnualScheduleAction");
            const res = await importAnnualScheduleAction(schoolId, classCsvData, configClass, "classes");

            if (res.success) {
                alert(res.message);
                // Stay on step
            } else {
                alert(`Error: ${res.message}`);
            }
        } catch (err) {
            console.error(err);
            alert("Error saving classes");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAnalyzeSubjects = async () => {
        setIsLoading(true);
        try {
            const allSubjects = new Set<string>();
            const allWorkGroups = new Set<string>();

            // Process Teacher Data if available
            if (teacherCsvData.length > 0) {
                const blocks = parseCsvToBlocks(teacherCsvData, configTeacher);
                const { subjects, workGroups } = extractSubjectsFromGrid(blocks, configTeacher);
                subjects.forEach(s => allSubjects.add(s));
                workGroups.forEach(s => allWorkGroups.add(s));
            }

            // Process Class Data if available
            if (classCsvData.length > 0) {
                const blocks = parseCsvToBlocks(classCsvData, configClass);
                const { subjects, workGroups } = extractSubjectsFromGrid(blocks, configClass);
                subjects.forEach(s => allSubjects.add(s));
                workGroups.forEach(s => allWorkGroups.add(s));
            }

            setPreviewSubjects(Array.from(allSubjects).sort());
            setPreviewWorkGroups(Array.from(allWorkGroups).sort());
            setStep(7);
        } catch (err) {
            console.error(err);
            errorToast("שגיאה בניתוח מקצועות");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveSubjects = async () => {
        if (!schoolId) return;
        setIsLoading(true);
        try {
            const { importAnnualScheduleAction } = await import("@/app/actions/POST/importAnnualScheduleAction");

            // We now pass the EDITED list of subjects (previewSubjects) directly to the server action
            // This ensures deletions/adjustments made in the UI are respected.
            // We pass empty CSV data as we are using the manual override.

            const res = await importAnnualScheduleAction(schoolId, [], configTeacher, "subjects", previewSubjects);

            if (res.success) {
                successToast(res.message);
            } else {
                errorToast(res.message);
            }

        } catch (err) {
            console.error(err);
            errorToast("שגיאה בשמירת מקצועות");
        } finally {
            setIsLoading(false);
        }
    };

    const handleNext = () => {
        if (step === 1 && teacherFile) {
            setStep(2);
        } else if (step === 2) {
            handleAnalyze(2);
        } else if (step === 3) {
            setStep(4);
        } else if (step === 4 && classFile) {
            setStep(5);
        } else if (step === 5) {
            handleAnalyze(5);
        } else if (step === 6) {
            handleAnalyzeSubjects();
        } else if (step === 7) {
            setStep(8);
        } else if (step === 8) {
            reset();
            successToast("תהליך הייבוא הושלם בהצלחה!", Infinity);
        }
    };

    const handlePrev = () => {
        if (step === 2) setStep(1);
        if (step === 3) setStep(2);
        if (step === 4) setStep(3); // Go back to Teachers verify
        if (step === 5) setStep(4);
        if (step === 6) setStep(5);
        if (step === 7) setStep(6);
        if (step === 8) setStep(7);
    };

    // Preview Table Component
    const PreviewTable = ({ data, config }: { data: string[][], config: CsvAnalysisConfig }) => {
        return (
            <div className={styles.previewContainer}>
                <h3 className={styles.sectionTitle}>תצוגה מקדימה (50 שורות ראשונות)</h3>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <tbody>
                            {data.map((row, idx) => {
                                const rowNum = idx + 1;
                                let rowClass = styles.row;

                                // Highlight logic
                                if (rowNum === config.teacherNameRow) rowClass += ` ${styles.rowTeacher}`;
                                else if (rowNum === config.headerRow) rowClass += ` ${styles.rowHeader}`;
                                else if (rowNum >= config.dataStartRow && config.separator === "empty_line" && row.every(c => !c.trim())) {
                                    rowClass += ` ${styles.rowSeparator}`;
                                }

                                return (
                                    <tr key={idx} className={rowClass}>
                                        <td className={styles.cellIndex}>
                                            {rowNum}
                                        </td>
                                        <td className={styles.cellContent} dir="ltr">
                                            <div className="flex gap-2">
                                                {row.map((cell, cellIdx) => {
                                                    const colNum = cellIdx + 1;
                                                    const isHourCol = config.hourColumn === colNum;
                                                    return (
                                                        <span
                                                            key={cellIdx}
                                                            className={`${isHourCol ? "bg-yellow-100 border-yellow-300" : "bg-gray-50"} border px-2 py-1 rounded text-sm min-w-[30px] text-center inline-block`}
                                                            title={isHourCol ? "עמודת שעות (לא תיקרא)" : undefined}
                                                        >
                                                            {cell || "-"}
                                                        </span>
                                                    )
                                                })}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <div className={styles.legend}>
                    <span className={styles.legendItem}>
                        <span className={`${styles.legendBox} ${styles.legendBoxTeacher}`}></span>
                        שורת שם (מורה/כיתה)
                    </span>
                    <span className={styles.legendItem}>
                        <span className={`${styles.legendBox} ${styles.legendBoxHeader}`}></span>
                        שורת כותרת
                    </span>
                    <span className={styles.legendItem}>
                        <span className={`${styles.legendBox} ${styles.legendBoxSeparator}`}></span>
                        מפריד
                    </span>
                </div>
            </div>
        );
    };

    // Editable List Component
    const EditableList = ({ title, items, onChange }: { title: string, items: string[], onChange: (items: string[]) => void }) => {
        const handleDelete = (index: number) => {
            const newItems = items.filter((_, i) => i !== index);
            onChange(newItems);
        };

        const handleAdd = () => {
            onChange([...items, ""]);
        };

        return (
            <div className={`flex flex-col h-full bg-white rounded-lg border shadow-sm mb-4 ${styles.listColumn || ''}`}>
                <div className="flex justify-between items-center p-3 bg-gray-50 border-b">
                    <h4 className="font-bold text-gray-700">{title} ({items.length})</h4>
                    <button onClick={handleAdd} className="text-blue-600 hover:text-blue-800 text-sm font-medium px-2 py-1 bg-blue-50 rounded transition-colors">+ הוסף</button>
                </div>

                <div className="flex flex-col gap-2 overflow-y-auto p-2 h-[400px]">
                    {items.map((item, idx) => (
                        <div key={idx} className="flex gap-2 items-center group">
                            <span className="text-gray-400 text-xs w-4">{idx + 1}.</span>
                            <input
                                value={item}
                                className="border p-2 rounded text-sm w-full focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                onChange={(e) => {
                                    const newItems = [...items];
                                    newItems[idx] = e.target.value;
                                    onChange(newItems);
                                }}
                                placeholder="הזן ערך..."
                            />
                            <button
                                onClick={() => handleDelete(idx)}
                                className="text-gray-400 hover:text-red-500 p-1 opacity-100 transition-all rounded hover:bg-red-50"
                                title="מחק שורה"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                                </svg>
                            </button>
                        </div>
                    ))}
                    {items.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2 mt-10">
                            <span>אין נתונים</span>
                            <button onClick={handleAdd} className="text-blue-500 hover:underline text-sm">הוסף פריט ראשון</button>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <AnnualImportPageLayout>
            <div className={styles.container}>

                {/* --- TEACHERS PHASE --- */}

                {/* Step 1: Upload (Teacher) */}
                {step === 1 && (
                    <div className={styles.stepContainer}>
                        <div className={styles.uploadSection}>
                            <h2 className="text-xl font-bold mb-2">ייבוא מערכת שעות לפי מורה</h2>
                            <input
                                ref={teacherFileInputRef}
                                type="file"
                                accept=".csv"
                                onChange={handleTeacherFileChange}
                                className="hidden"
                                disabled={isLoading}
                            />
                        </div>

                        <div className="text-center text-gray-500">שלב {step} מתוך 8</div>
                        <div className={styles.actions}>
                            <SubmitBtn
                                onClick={handleNext}
                                buttonText="שלב הבא"
                                isLoading={false}
                                type="button"
                                disabled={!teacherFile}
                            />
                        </div>
                    </div>
                )}

                {/* Step 2: Configuration (Teacher) */}
                {step === 2 && (
                    <div className={styles.configSection}>
                        <div className={styles.header}>
                            <h2 className={styles.title}>הגדרות ייבוא מורים</h2>
                        </div>

                        <div className={styles.gridContainer}>
                            <div className={styles.formCard}>
                                <h3 className={styles.sectionTitle}>הגדרות זיהוי</h3>

                                <InputText
                                    label="מספר השורה הראשונה בה מופיע שם המורה"
                                    type="number"
                                    value={configTeacher.teacherNameRow}
                                    onChange={(e) => handleConfigTeacherChange("teacherNameRow", parseInt(e.target.value))}
                                    min={1}
                                />
                                <InputText
                                    label="מספר השורה הראשונה בה מתחילה הכותרת (ימים/שעות)"
                                    type="number"
                                    value={configTeacher.headerRow}
                                    onChange={(e) => handleConfigTeacherChange("headerRow", parseInt(e.target.value))}
                                    min={1}
                                />
                                <InputText
                                    label="מספר השורה הראשונה בה מתחילים הנתונים"
                                    type="number"
                                    value={configTeacher.dataStartRow}
                                    onChange={(e) => handleConfigTeacherChange("dataStartRow", parseInt(e.target.value))}
                                    min={1}
                                />
                                <InputText
                                    label="מספר עמודת השעות (אם מופיעה)"
                                    type="number"
                                    value={configTeacher.hourColumn || ""}
                                    onChange={(e) => handleConfigTeacherChange("hourColumn", e.target.value ? parseInt(e.target.value) : undefined)}
                                    min={1}
                                    placeholder="למשל: 1"
                                />

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-gray-700">סימון רווח בין מערכות</label>
                                    <DynamicInputSelect
                                        options={separatorOptions}
                                        value={configTeacher.separator}
                                        onChange={(val) => handleConfigTeacherChange("separator", val)}
                                        placeholder="בחר סוג הפרדה"
                                    />
                                    {configTeacher.separator === "custom" && (
                                        <div className="mt-2">
                                            <InputText
                                                label="הזן תו מפריד"
                                                value={customSeparator}
                                                onChange={(e) => setCustomSeparator(e.target.value)}
                                            />
                                        </div>
                                    )}
                                </div>
                                <InputText
                                    label="טקסט להסרה משם המורה (אופציונלי)"
                                    type="text"
                                    value={configTeacher.ignoreText}
                                    onChange={(e) => handleConfigTeacherChange("ignoreText", e.target.value)}
                                    placeholder="לדוגמה: מערכת שעות"
                                />
                            </div>

                            <PreviewTable data={teacherCsvData} config={configTeacher} />
                        </div>

                        <div className="text-center text-gray-500">שלב {step} מתוך 8</div>
                        <div className={styles.actions}>
                            <SubmitBtn
                                onClick={handlePrev}
                                buttonText="שלב קודם"
                                className={styles.btnSecondary}
                                isLoading={false}
                                type="button"
                            />
                            <SubmitBtn
                                onClick={handleNext}
                                buttonText="שלב הבא"
                                className={styles.btnPrimary}
                                isLoading={isLoading}
                                type="button"
                            />
                        </div>
                    </div>
                )}

                {/* Step 3: Verify (Teachers) */}
                {step === 3 && (
                    <div className={styles.configSection}>
                        <h2 className="text-xl font-bold mb-4 text-center">אימות רשימת מורים</h2>
                        <div className="flex flex-col items-center w-full gap-4">
                            <div className="w-full md:w-1/2 h-[500px]">
                                <EditableList title="מורים שזוהו" items={previewTeachers} onChange={(items) => setPreviewTeachers(items)} />
                            </div>
                            <div className={styles.updateButtonContainer}>
                                <SubmitBtn
                                    onClick={handleSaveTeachers}
                                    buttonText="עדכן בטבלת המורים"
                                    className={styles.btnUpdate}
                                    isLoading={isLoading}
                                    type="button"
                                />
                            </div>
                        </div>
                        <div className="text-center text-gray-500">שלב {step} מתוך 8</div>
                        <div className={styles.actions}>
                            <SubmitBtn
                                onClick={handlePrev}
                                buttonText="שלב קודם"
                                className={styles.btnSecondary}
                                isLoading={false}
                                type="button"
                            />
                            <SubmitBtn
                                onClick={handleNext}
                                buttonText="שלב הבא"
                                className={styles.btnPrimary}
                                isLoading={false}
                                type="button"
                            />
                        </div>
                    </div>
                )}


                {/* --- CLASSES PHASE --- */}

                {/* Step 4: Upload (Class) */}
                {step === 4 && (
                    <div className={styles.stepContainer}>
                        <div className={styles.uploadSection}>
                            <h2 className="text-xl font-bold mb-2">ייבוא מערכת שעות לפי כיתה</h2>
                            <input
                                ref={classFileInputRef}
                                type="file"
                                accept=".csv"
                                onChange={handleClassFileChange}
                                className="hidden"
                                disabled={isLoading}
                            />
                        </div>

                        <div className="text-center text-gray-500">שלב {step} מתוך 8</div>
                        <div className={styles.actions}>
                            <SubmitBtn
                                onClick={handleNext}
                                buttonText="שלב הבא"
                                isLoading={false}
                                type="button"
                                disabled={!classFile}
                            />
                        </div>
                    </div>
                )}

                {/* Step 5: Configuration (Class) */}
                {step === 5 && (
                    <div className={styles.configSection}>
                        <div className={styles.header}>
                            <h2 className={styles.title}>הגדרות ייבוא כיתות</h2>
                        </div>

                        <div className={styles.gridContainer}>
                            <div className={styles.formCard}>
                                <h3 className={styles.sectionTitle}>הגדרות זיהוי</h3>

                                <InputText
                                    label="מספר השורה הראשונה בה מופיע שם הכיתה"
                                    type="number"
                                    value={configClass.teacherNameRow}
                                    onChange={(e) => handleConfigClassChange("teacherNameRow", parseInt(e.target.value))}
                                    min={1}
                                />
                                <InputText
                                    label="מספר השורה הראשונה בה מתחילה הכותרת (ימים/שעות)"
                                    type="number"
                                    value={configClass.headerRow}
                                    onChange={(e) => handleConfigClassChange("headerRow", parseInt(e.target.value))}
                                    min={1}
                                />
                                <InputText
                                    label="מספר השורה הראשונה בה מתחילים הנתונים"
                                    type="number"
                                    value={configClass.dataStartRow}
                                    onChange={(e) => handleConfigClassChange("dataStartRow", parseInt(e.target.value))}
                                    min={1}
                                />
                                <InputText
                                    label="מספר עמודת השעות (אם מופיעה)"
                                    type="number"
                                    value={configClass.hourColumn || ""}
                                    onChange={(e) => handleConfigClassChange("hourColumn", e.target.value ? parseInt(e.target.value) : undefined)}
                                    min={1}
                                    placeholder="למשל: 1"
                                />

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-gray-700">סימון רווח בין מערכות</label>
                                    <DynamicInputSelect
                                        options={separatorOptions}
                                        value={configClass.separator}
                                        onChange={(val) => handleConfigClassChange("separator", val)}
                                        placeholder="בחר סוג הפרדה"
                                    />
                                    {configClass.separator === "custom" && (
                                        <div className="mt-2">
                                            <InputText
                                                label="הזן תו מפריד"
                                                value={customSeparator}
                                                onChange={(e) => setCustomSeparator(e.target.value)}
                                            />
                                        </div>
                                    )}
                                </div>
                                <InputText
                                    label="טקסט להסרה משם הכיתה (אופציונלי)"
                                    type="text"
                                    value={configClass.ignoreText}
                                    onChange={(e) => handleConfigClassChange("ignoreText", e.target.value)}
                                    placeholder="לדוגמה: מערכת שעות"
                                />
                            </div>

                            <PreviewTable data={classCsvData} config={configClass} />
                        </div>

                        <div className="text-center text-gray-500">שלב {step} מתוך 8</div>
                        <div className={styles.actions}>
                            <SubmitBtn
                                onClick={handlePrev}
                                buttonText="שלב קודם"
                                className={styles.btnSecondary}
                                isLoading={false}
                                type="button"
                            />
                            <SubmitBtn
                                onClick={handleNext}
                                buttonText="שלב הבא"
                                className={styles.btnPrimary}
                                isLoading={isLoading}
                                type="button"
                            />
                        </div>
                    </div>
                )}

                {/* Step 6: Verify (Classes) */}
                {step === 6 && (
                    <div className={styles.configSection}>
                        <h2 className="text-xl font-bold mb-4 text-center">אימות רשימת כיתות</h2>
                        <div className="flex flex-col items-center w-full gap-4">
                            <div className="w-full md:w-1/2 h-[500px]">
                                <EditableList title="כיתות שזוהו" items={previewClasses} onChange={(items) => setPreviewClasses(items)} />
                            </div>
                            <div className={styles.updateButtonContainer}>
                                <SubmitBtn
                                    onClick={handleSaveClasses}
                                    buttonText="עדכן בטבלת הכיתות"
                                    className={styles.btnUpdate}
                                    isLoading={isLoading}
                                    type="button"
                                />
                            </div>
                        </div>
                        <div className="text-center text-gray-500">שלב {step} מתוך 8</div>
                        <div className={styles.actions}>
                            <SubmitBtn
                                onClick={handlePrev}
                                buttonText="שלב קודם"
                                className={styles.btnSecondary}
                                isLoading={false}
                                type="button"
                            />
                            <SubmitBtn
                                onClick={handleNext}
                                buttonText="שלב הבא"
                                className={styles.btnPrimary}
                                isLoading={false}
                                type="button"
                            />
                        </div>
                    </div>
                )}

                {/* Step 7: Verify (Subjects) */}
                {step === 7 && (
                    <div className={styles.configSection}>
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-bold mb-2">אימות רשימת מקצועות</h2>
                            <p className="text-gray-500">המערכת אספה מקצועות (מהשורות התחתונות בכל תא) משני הקבצים.</p>
                        </div>
                        <div className="flex flex-col items-center w-full gap-4">
                            <div className="w-full md:w-1/2 h-[500px]">
                                <EditableList title="מקצועות שזוהו" items={previewSubjects} onChange={(items) => setPreviewSubjects(items)} />
                            </div>
                            <div className={styles.updateButtonContainer}>
                                <SubmitBtn
                                    onClick={handleSaveSubjects}
                                    buttonText="עדכן בטבלת המקצועות"
                                    className={styles.btnUpdate}
                                    isLoading={isLoading}
                                    type="button"
                                />
                            </div>
                        </div>
                        <div className="text-center text-gray-500">שלב {step} מתוך 8</div>
                        <div className={styles.actions}>
                            <SubmitBtn
                                onClick={handlePrev}
                                buttonText="שלב קודם"
                                className={styles.btnSecondary}
                                isLoading={false}
                                type="button"
                            />
                            <SubmitBtn
                                onClick={handleNext}
                                buttonText="שלב הבא"
                                className={styles.btnPrimary}
                                isLoading={false}
                                type="button"
                            />
                        </div>
                    </div>
                )}

                {/* Step 8: Verify (Work Groups) */}
                {step === 8 && (
                    <div className={styles.configSection}>
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-bold mb-2">קבוצות עבודה נוספות</h2>
                            <p className="text-gray-500">פריטים המכילים מילות מפתח (כמו "צוות", "פרטני", "ניהול" וכו') הועברו לכאן.</p>
                        </div>
                        <div className="flex flex-col items-center w-full gap-4">
                            <div className="w-full md:w-1/2 h-[500px]">
                                <EditableList title="קבוצות עבודה" items={previewWorkGroups} onChange={(items) => setPreviewWorkGroups(items)} />
                            </div>
                            <div className={styles.updateButtonContainer}>
                                {/* Future: Save Work Groups */}
                                <SubmitBtn
                                    onClick={() => alert("שמירת קבוצות עבודה - יבוצע בעתיד (שלב 8)")}
                                    buttonText="שמור קבוצות עבודה (הדגמה)"
                                    className={`${styles.btnUpdate} opacity-50 cursor-not-allowed`}
                                    isLoading={false}
                                    type="button"
                                    disabled={true}
                                />
                            </div>
                        </div>
                        <div className="text-center text-gray-500">שלב {step} מתוך 8</div>
                        <div className={styles.actions}>
                            <SubmitBtn
                                onClick={handlePrev}
                                buttonText="שלב קודם"
                                className={styles.btnSecondary}
                                isLoading={false}
                                type="button"
                            />
                            <SubmitBtn
                                onClick={handleNext}
                                buttonText="סיום"
                                className={styles.btnSuccess}
                                isLoading={false}
                                type="button"
                            />
                        </div>
                    </div>
                )}
            </div>
        </AnnualImportPageLayout >
    );
};

export default AnnualImportPage;
