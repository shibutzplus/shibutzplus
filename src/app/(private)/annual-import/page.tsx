"use client";

import React, { useState, useRef, useEffect } from "react";
import Papa, { ParseResult } from "papaparse";
import AnnualImportPageLayout from "@/components/layout/pageLayouts/AnnualImportPageLayout/AnnualImportPageLayout";
import SubmitBtn from "@/components/ui/buttons/SubmitBtn/SubmitBtn";
import InputText from "@/components/ui/inputs/InputText/InputText";
import DynamicInputSelect from "@/components/ui/select/InputSelect/DynamicInputSelect";
import styles from "./page.module.css";
import { useOptionalMainContext } from "@/context/MainContext";
import { errorToast, successToast } from "@/lib/toast";
import { parseCsvToBlocks, extractSubjectsFromGrid } from "@/utils/importUtils";
import PopupModal from "@/components/popups/PopupModal/PopupModal";

type CsvAnalysisConfig = {
    teacherNameRow: number;
    headerRow: number;
    dataStartRow: number;
    separator: "empty_line" | string;
    ignoreText: string;
    hourColumn?: number;
    subjectLine?: "first" | "last" | "all";
    subjectSeparator?: string;
};

// Default separator options
const separatorOptions = [
    { value: "empty_line", label: "שורה ריקה" },
    { value: "custom", label: "תו מותאם אישית" },
];

const AnnualImportPage = () => {
    // 1-3: Teachers, 4-6: Classes
    const [step, setStep] = useState(1); // 1: Upload, 2: Config+Verify Teachers, 3: Config Classes, 4: Verify Classes, 5: Subjects, 6: Finish

    // --- Teachers State ---
    const [teacherFile, setTeacherFile] = useState<File | null>(null);
    const [teacherCsvData, setTeacherCsvData] = useState<string[][]>([]);
    const [configTeacher, setConfigTeacher] = useState<CsvAnalysisConfig>({
        teacherNameRow: 1,
        headerRow: 2,
        dataStartRow: 3,
        separator: "empty_line",
        ignoreText: "",
        subjectLine: "first",
        subjectSeparator: ","
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
        subjectLine: "first",
        subjectSeparator: ","
    });
    const [previewClasses, setPreviewClasses] = useState<string[]>([]);

    // --- Subjects State (Step 7) ---
    const [previewSubjects, setPreviewSubjects] = useState<string[]>([]);
    const [previewWorkGroups, setPreviewWorkGroups] = useState<string[]>([]);

    const [customSeparator, setCustomSeparator] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Confirmation Modal State
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);

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

    // Auto-analyze teachers on config change
    useEffect(() => {
        if (step !== 2 || !teacherFile) return;
        const timer = setTimeout(() => {
            handleAnalyze(2, false);
        }, 500);
        return () => clearTimeout(timer);
    }, [configTeacher, teacherFile, step]);

    // Auto-analyze classes on config change (Step 3)
    useEffect(() => {
        if (step !== 3 || !classFile) return;
        const timer = setTimeout(() => {
            handleAnalyze(3, false);
        }, 500);
        return () => clearTimeout(timer);
    }, [configClass, classFile, step]);

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
    const handleAnalyze = async (analyzeStep: 2 | 3 | 5, autoAdvance: boolean = true) => {
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
                            if (autoAdvance) {
                                // Logic if needed, but for step 2 we stay put or move to next manually
                            }
                        } else {
                            setPreviewClasses(res.data.teachers);
                            if (autoAdvance) {
                                // Logic if needed
                            }
                        }
                    } else {
                        // Don't alert on auto-analyze to avoid spamming errors while typing
                        if (autoAdvance) alert(res.message);
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


    // Auto-analyze Subjects when config changes (debounced)
    useEffect(() => {
        if (step === 4) {
            const timer = setTimeout(() => {
                handleAnalyzeSubjects();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [configTeacher.subjectLine, configTeacher.subjectSeparator, step]);

    // Generic save handler wrapper
    const handleRequestSave = (action: () => void) => {
        setConfirmAction(() => action);
        setIsConfirmOpen(true);
    };

    const handleConfirmSave = () => {
        if (confirmAction) {
            confirmAction();
        }
        setIsConfirmOpen(false);
    };

    const saveTeachersToDb = async () => {
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

    const saveClassesToDb = async () => {
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
            setStep(4);
        } catch (err) {
            console.error(err);
            errorToast("שגיאה בניתוח מקצועות");
        } finally {
            setIsLoading(false);
        }
    };

    const saveSubjectsToDb = async () => {
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

    const saveWorkGroupsToDb = async () => {
        if (!schoolId) return;
        setIsLoading(true);
        try {
            const { importAnnualScheduleAction } = await import("@/app/actions/POST/importAnnualScheduleAction");

            // Save work groups as BOTH classes and subjects with activity=true
            const res = await importAnnualScheduleAction(schoolId, [], configTeacher, "workGroups", previewWorkGroups);

            if (res.success) {
                successToast(res.message);
            } else {
                errorToast(res.message);
            }

        } catch (err) {
            console.error(err);
            errorToast("שגיאה בשמירת קבוצות עבודה");
        } finally {
            setIsLoading(false);
        }
    };

    const handleNext = () => {
        if (step === 1) {
            setStep(2);
        } else if (step === 2) {
            if (previewTeachers.length === 0) {
                handleAnalyze(2, true);
            }
            setStep(3);
        } else if (step === 3) {
            if (previewClasses.length === 0) {
                handleAnalyze(3, true); // Analyze "Classes" (ID 3 internally for now, or keep 5 if logic requires)
                // NOTE: Logic currently uses 2 or 5. Let's stick to 5 for "Classes" in backend logic if that's what it expects?
                // But wait, handleAnalyze takes "2 | 5". Let's update handleAnalyze signature cleanly if needed.
                // Actually, let's keep it '5' in the call if the backend expects it, but pass '3' if we refactor.
                // Let's look at handleAnalyze: "analyzeStep: 2 | 5". 
                // So we should call handleAnalyze(5, true) here.
            }
            handleAnalyzeSubjects();
            // handleAnalyzeSubjects sets step to 5 originally. We want it to go to 4 (Subjects).
            // We need to update handleAnalyzeSubjects to setStep(4).
        } else if (step === 4) {
            setStep(5);
        } else if (step === 5) {
            reset();
            successToast("תהליך הייבוא הושלם בהצלחה!", Infinity);
        }
    };

    const handlePrev = () => {
        if (step === 2) setStep(1);
        if (step === 3) setStep(2);
        if (step === 4) setStep(3);
        if (step === 5) setStep(4);
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
            <div className={`${styles.editableListContainer} ${styles.listColumn || ''}`}>
                <div className={styles.editableListHeader}>
                    <h4 className={styles.editableListTitle}>{title} ({items.length})</h4>
                    <button onClick={handleAdd} className={styles.editableAddButton}>+ הוסף</button>
                </div>

                <div className={styles.editableContent}>
                    {items.map((item, idx) => (
                        <div key={idx} className={styles.editableItem}>
                            <span className={styles.editableIndex}>{idx + 1}.</span>
                            <input
                                value={item}
                                className={styles.editableInput}
                                onChange={(e) => {
                                    const newItems = [...items];
                                    newItems[idx] = e.target.value;
                                    onChange(newItems);
                                }}
                                placeholder="הזן ערך..."
                            />
                            <button
                                onClick={() => handleDelete(idx)}
                                className={styles.editableDeleteButton}
                                title="מחק שורה"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                                </svg>
                            </button>
                        </div>
                    ))}
                    {items.length === 0 && (
                        <div className={styles.emptyState}>
                            <span>אין נתונים</span>
                            <button onClick={handleAdd} className={styles.emptyAddButton}>הוסף פריט ראשון</button>
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

                {/* Step 1: Upload (Teacher & Class) */}
                {step === 1 && (
                    <div className={styles.stepContainer}>
                        <div className={styles.uploadContainer}>
                            <div>
                                {/* Teacher Upload */}
                                <h3 className={styles.subTitle}>מערכת לפי מורים</h3>
                                <input
                                    ref={teacherFileInputRef}
                                    type="file"
                                    accept=".csv"
                                    onChange={handleTeacherFileChange}
                                    disabled={isLoading}
                                    className={styles.fileInput}
                                />
                                {teacherFile && <span className={styles.fileSuccess}>נבחר: {teacherFile.name}</span>}

                                {/* Class Upload */}
                                <br /><br />
                                <h3 className={styles.subTitle}>מערכת לפי כיתות</h3>
                                <input
                                    ref={classFileInputRef}
                                    type="file"
                                    accept=".csv"
                                    onChange={handleClassFileChange}
                                    disabled={isLoading}
                                    className={styles.fileInput}
                                />
                                {classFile && <span className={styles.fileSuccess}>נבחר: {classFile.name}</span>}
                            </div>
                        </div>
                        <br /><br />

                        <div className={styles.actions}>
                            <div className={styles.stepLabel}>שלב {step} מתוך 5</div>
                            <div className={styles.buttonsRow}>
                                <SubmitBtn
                                    onClick={handleNext}
                                    buttonText="שלב הבא"
                                    isLoading={false}
                                    type="button"
                                    disabled={!teacherFile && !classFile}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Configuration & Verify (Teacher) Combined */}
                {step === 2 && (
                    <div className={styles.configSection}>
                        <h2 className={`${styles.title} ${styles.stepTitle}`}>רשימת המורים</h2>

                        <table className={styles.stepTable}>
                            <tbody>
                                <tr>
                                    {/* CONFIGURATION (First column = Right in RTL) */}
                                    <td className={styles.cellConfig}>
                                        <div className={styles.formCard} style={{ width: '100%' }}>
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

                                            <div className={styles.flexGap}>
                                                <label className="text-sm font-medium text-gray-700">סימון רווח בין מערכות</label>
                                                <DynamicInputSelect
                                                    options={separatorOptions}
                                                    value={configTeacher.separator}
                                                    onChange={(val) => handleConfigTeacherChange("separator", val)}
                                                    placeholder="בחר סוג הפרדה"
                                                />
                                                {configTeacher.separator === "custom" && (
                                                    <div className={styles.mt2}>
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
                                    </td>

                                    {/* LIST (Second column = Left in RTL) */}
                                    <td className={styles.cellList}>
                                        <div className={styles.listHeight}>
                                            <EditableList title="מורים שזוהו" items={previewTeachers} onChange={(items) => setPreviewTeachers(items)} />
                                        </div>
                                        <div className={`${styles.mt4} ${styles.flexEnd}`}>
                                            <SubmitBtn
                                                onClick={() => handleRequestSave(saveTeachersToDb)}
                                                buttonText="עדכון טבלת המורים"
                                                className={styles.btnUpdate}
                                                isLoading={isLoading}
                                                type="button"
                                            />
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <div className={styles.actions}>
                            <div className="w-full text-right text-gray-500">שלב {step} מתוך 6</div>
                            <div className={styles.buttonsRow}>
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
                    </div>
                )}


                {/* --- CLASSES PHASE --- */}



                {/* Step 3: Class Configuration & Verify (Combined) */}
                {step === 3 && (
                    <div className={styles.configSection}>
                        <h2 className={`${styles.title} ${styles.stepTitle}`}>רשימת הכיתות</h2>

                        <table className={styles.stepTable}>
                            <tbody>
                                <tr>
                                    {/* CONFIGURATION (First column = Right in RTL) */}
                                    <td className={styles.cellConfig}>
                                        <div className={styles.formCard} style={{ width: '100%' }}>
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

                                            <div className={styles.flexGap}>
                                                <label className="text-sm font-medium text-gray-700">סימון רווח בין מערכות</label>
                                                <DynamicInputSelect
                                                    options={separatorOptions}
                                                    value={configClass.separator}
                                                    onChange={(val) => handleConfigClassChange("separator", val)}
                                                    placeholder="בחר סוג הפרדה"
                                                />
                                                {configClass.separator === "custom" && (
                                                    <div className={styles.mt2}>
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
                                    </td>

                                    {/* LIST (Second column = Left in RTL) */}
                                    <td className={styles.cellList}>
                                        <div className={styles.listHeight}>
                                            <EditableList title="כיתות שזוהו" items={previewClasses} onChange={(items) => setPreviewClasses(items)} />
                                        </div>
                                        <div className={`${styles.mt4} ${styles.flexEnd}`}>
                                            <SubmitBtn
                                                onClick={() => handleRequestSave(saveClassesToDb)}
                                                buttonText="עדכון טבלת הכיתות"
                                                className={styles.btnUpdate}
                                                isLoading={isLoading}
                                                type="button"
                                            />
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <div className={styles.actions}>
                            <div className="w-full text-right text-gray-500">שלב {step} מתוך 5</div>
                            <div className={styles.buttonsRow}>
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
                    </div>
                )}

                {/* Step 4: Subjects - Was 5 */}
                {step === 4 && (
                    <div className={styles.configSection}>
                        <h2 className={`${styles.title} ${styles.stepTitle}`}>רשימת מקצועות</h2>

                        <table className={styles.stepTable}>
                            <tbody>
                                <tr>
                                    {/* CONFIG (First column = Right in RTL) */}
                                    <td className={styles.cellConfig}>
                                        <div className={`${styles.formCard} ${styles.formCardWidth}`}>
                                            <h3 className={styles.sectionTitle}>הגדרות זיהוי מקצועות</h3>

                                            <DynamicInputSelect
                                                label="שורה בתא (עבור מקצוע)"
                                                value={configTeacher.subjectLine || "first"}
                                                onChange={(val) => {
                                                    setConfigTeacher(prev => ({ ...prev, subjectLine: val as any }));
                                                    setConfigClass(prev => ({ ...prev, subjectLine: val as any }));
                                                    setTimeout(() => handleAnalyzeSubjects(), 100);
                                                }}
                                                options={[
                                                    { value: "first", label: "שורה ראשונה (ברירת מחדל)" },
                                                    { value: "last", label: "שורה אחרונה" },
                                                    { value: "all", label: "כל השורות" }
                                                ]}
                                                placeholder="בחר שורה..."
                                            />

                                            <div className={styles.mt4}>
                                                <InputText
                                                    label="תו מפריד בין מקצועות"
                                                    type="text"
                                                    value={configTeacher.subjectSeparator || ","}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setConfigTeacher(prev => ({ ...prev, subjectSeparator: val }));
                                                        setConfigClass(prev => ({ ...prev, subjectSeparator: val }));
                                                    }}
                                                    onBlur={() => handleAnalyzeSubjects()}
                                                    placeholder="לדוגמה: פסיק (,)"
                                                />
                                            </div>
                                        </div>
                                    </td>

                                    {/* LIST (Second column = Left in RTL) */}
                                    <td className={styles.cellList}>
                                        <div className={styles.listHeight}>
                                            <EditableList title="מקצועות שזוהו" items={previewSubjects} onChange={(items) => setPreviewSubjects(items)} />
                                        </div>
                                        <div className={`${styles.mt4} ${styles.flexEnd}`}>
                                            <SubmitBtn
                                                onClick={() => handleRequestSave(saveSubjectsToDb)}
                                                buttonText="עדכון טבלת מקצועות"
                                                className={styles.btnUpdate}
                                                isLoading={isLoading}
                                                type="button"
                                            />
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <div className={styles.actions}>
                            <div className={styles.stepLabel}>שלב {step} מתוך 5</div>
                            <div className={styles.buttonsRow}>
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
                    </div>
                )}

                {/* Step 5: Verify (Work Groups) - Was 6 */}
                {step === 5 && (
                    <div className={styles.configSection}>
                        <h2 className={`${styles.title} ${styles.stepTitle}`}>קבוצות עבודה</h2>

                        <div className={styles.verifyContainer}>
                            <div className={styles.verifyListWrapper}>
                                <EditableList title="קבוצות עבודה" items={previewWorkGroups} onChange={(items) => setPreviewWorkGroups(items)} />
                            </div>
                            <div className={styles.updateButtonContainer}>
                                {/* Future: Save Work Groups */}
                                <SubmitBtn
                                    onClick={() => handleRequestSave(saveWorkGroupsToDb)}
                                    buttonText="שמור קבוצות עבודה"
                                    className={styles.btnUpdate}
                                    isLoading={isLoading}
                                    type="button"
                                />
                            </div>
                        </div>
                        <div className={styles.actions}>
                            <div className={styles.stepLabel}>שלב {step} מתוך 5</div>
                            <div className={styles.buttonsRow}>
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
                    </div>
                )}
                {/* Confirmation Popup */}
                <PopupModal
                    isOpen={isConfirmOpen}
                    onClose={() => setIsConfirmOpen(false)}
                    size="S"
                >
                    <div className={styles.modalContentWrapper}>
                        <h3 className={styles.modalText}>האם להמשיך?</h3>
                        <div className={styles.modalActions}>
                            <button
                                className={styles.modalBtnYes}
                                onClick={handleConfirmSave}
                            >
                                כן
                            </button>
                            <button
                                className={styles.modalBtnNo}
                                onClick={() => setIsConfirmOpen(false)}
                            >
                                לא
                            </button>
                        </div>
                    </div>
                </PopupModal>
            </div>
        </AnnualImportPageLayout >
    );
};

export default AnnualImportPage;
