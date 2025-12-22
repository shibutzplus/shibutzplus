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
import EditableList from "./components/EditableList";
import ImportConfigStep, { CsvAnalysisConfig } from "./components/ImportConfigStep";
import StepNavigation from "./components/StepNavigation";

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

    const [previewSubjects, setPreviewSubjects] = useState<string[]>([]);
    const [previewWorkGroups, setPreviewWorkGroups] = useState<string[]>([]);

    // --- Final Step 6 State ---
    const [dbTeachers, setDbTeachers] = useState<{ id: string, name: string }[]>([]);
    const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
    const [previewSchedule, setPreviewSchedule] = useState<any[]>([]);
    const [classLineInCell, setClassLineInCell] = useState<string>("2");

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

        const fileToParse = analyzeStep === 2 ? teacherFile : classFile;

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



    const saveToDb = async (
        type: "teachers" | "classes" | "subjects" | "workGroups",
        csvData: string[][],
        config: CsvAnalysisConfig,
        manualList?: string[]
    ) => {
        if (!schoolId) return;
        setIsLoading(true);
        try {
            const { importAnnualScheduleAction } = await import("@/app/actions/POST/importAnnualScheduleAction");

            // If manualList is provided, pass it (for subjects/workGroups). 
            // Otherwise it's undefined (for teachers/classes).
            const res = await importAnnualScheduleAction(schoolId, csvData, config, type, manualList);

            if (res.success) {
                successToast(res.message);
            } else {
                errorToast(res.message);
            }

        } catch (err) {
            console.error(err);
            errorToast(`Error saving ${type}`);
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

    // --- Step 6 Logic ---
    const handleSingleTeacherUpdate = async () => {
        if (!schoolId || !selectedTeacherId) return;
        setIsLoading(true);
        try {
            const { generateAnnualScheduleAction } = await import("@/app/actions/POST/generateAnnualScheduleAction");
            const fullConfig = { ...configTeacher, classLine: classLineInCell };

            // Update ONLY the selected teacher
            const res = await generateAnnualScheduleAction(process.env.NEXT_PUBLIC_SCHOOL_ID || schoolId, teacherCsvData, fullConfig, selectedTeacherId, true);

            if (res.success) {
                successToast(res.message || "המערכת למורה עודכנה בהצלחה");

                if (res.data && res.data.errors && res.data.errors.length > 0) {
                    downloadErrorsCsv(res.data.errors);
                    successToast(`נמצאו ${res.data.errors.length} שגיאות. קובץ עם השגיאות מוכן להורדה.`);
                }
            } else {
                errorToast(res.message || "שגיאה בעדכון המערכת");
            }
        } catch (err) {
            console.error(err);
            errorToast("Error updating teacher schedule");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchDbTeachers = async () => {
        if (!schoolId) return;
        try {
            const { getTeachersAction } = await import("@/app/actions/GET/getTeachersAction");
            const res = await getTeachersAction(schoolId);
            if (res.success && res.data) {
                setDbTeachers(res.data);
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        if (step === 6) {
            fetchDbTeachers();
        }
    }, [step]);

    const handlePreviewTeacherSchedule = async (teacherId: string) => {
        if (!schoolId || !teacherId) return;
        setIsLoading(true);
        try {
            const { generateAnnualScheduleAction } = await import("@/app/actions/POST/generateAnnualScheduleAction");
            // Pass `classLine` in extra config
            const fullConfig = { ...configTeacher, classLine: classLineInCell };

            const res = await generateAnnualScheduleAction(process.env.NEXT_PUBLIC_SCHOOL_ID || schoolId, teacherCsvData, fullConfig, teacherId, false);

            if (res.success && res.data) {
                setPreviewSchedule(res.data.schedule || []);
                // If checking specific teacher, maybe set matched teacher name?
            } else {
                setPreviewSchedule([]);
            }
        } catch (err) {
            console.error(err);
            setPreviewSchedule([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-refresh preview if config changes
    useEffect(() => {
        if (step === 6 && selectedTeacherId) {
            const timer = setTimeout(() => {
                handlePreviewTeacherSchedule(selectedTeacherId);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [classLineInCell, selectedTeacherId]);

    const handleFinalUpdate = async () => {
        if (!schoolId) return;
        setIsLoading(true);
        try {
            const { generateAnnualScheduleAction } = await import("@/app/actions/POST/generateAnnualScheduleAction");
            const fullConfig = { ...configTeacher, classLine: classLineInCell };

            // This updates ALL teachers matched in the CSV
            const res = await generateAnnualScheduleAction(schoolId, teacherCsvData, fullConfig, undefined, true);

            if (res.success) {
                successToast(res.message || "הנתונים נשמרו בהצלחה");

                if (res.data && res.data.errors && res.data.errors.length > 0) {
                    downloadErrorsCsv(res.data.errors);
                    successToast(`נמצאו ${res.data.errors.length} שגיאות. קובץ עם השגיאות מוכן להורדה.`);
                }
            } else {
                errorToast(res.message || "שגיאה בשמירת הנתונים");
            }
        } catch (err) {
            console.error(err);
            errorToast("Error updating systems");
        } finally {
            setIsLoading(false);
        }
    };

    const downloadErrorsCsv = (errors: any[]) => {
        const header = "Teacher Name,Day,Hour,Cell Content,Error Reason\n";
        const rows = errors.map(e => {
            // Escape csv fields if needed
            const cleanCell = e.cellContent.replace(/"/g, '""');
            return `"${e.teacherName}",${e.day},${e.hour},"${cleanCell}","${e.reason}"`;
        }).join("\n");

        const csvContent = "\uFEFF" + header + rows; // Add BOM
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "import_errors.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
                handleAnalyze(3, true);
            }
            handleAnalyzeSubjects();
        } else if (step === 4) {
            setStep(5);
        } else if (step === 5) {
            setStep(6);
        } else if (step === 6) {
            reset();
            successToast("תהליך הייבוא הושלם בהצלחה!", Infinity);
        }
    };

    const handlePrev = () => {
        if (step === 2) setStep(1);
        if (step === 3) setStep(2);
        if (step === 4) setStep(3);
        if (step === 4) setStep(3);
        if (step === 5) setStep(4);
        if (step === 6) setStep(5);
    };



    return (
        <AnnualImportPageLayout>
            <div className={styles.container}>

                {/* --- TEACHERS PHASE --- */}

                {/* Step 1: Upload (Teacher & Class) */}
                {step === 1 && (
                    <div className={styles.stepContainer}>
                        <h2 className={`${styles.title} ${styles.stepTitle}`}>העלאת קבצים (שלב 1 מתוך 6)</h2>
                        <br /><br />
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

                        <StepNavigation
                            onNext={handleNext}
                            isNextDisabled={!teacherFile && !classFile}
                            showPrev={false}
                        />
                    </div>
                )}

                {/* Step 2: Configuration & Verify (Teacher) Combined */}
                {step === 2 && (
                    <ImportConfigStep
                        title="רשימת המורים (שלב 2 מתוך 6)"
                        config={configTeacher}
                        onConfigChange={handleConfigTeacherChange}
                        customSeparator={customSeparator}
                        setCustomSeparator={setCustomSeparator}
                        previewItems={previewTeachers}
                        onPreviewItemsChange={setPreviewTeachers}
                        listTitle="מורים שזוהו"
                        onSave={() => handleRequestSave(() => saveToDb("teachers", teacherCsvData, configTeacher))}
                        saveButtonText="עדכון טבלת המורים"
                        onNext={handleNext}
                        onPrev={handlePrev}
                        isLoading={isLoading}
                    />
                )}

                {/* --- CLASSES PHASE --- */}

                {/* Step 3: Class Configuration & Verify (Combined) */}
                {step === 3 && (
                    <ImportConfigStep
                        title="רשימת הכיתות (שלב 3 מתוך 6)"
                        config={configClass}
                        onConfigChange={handleConfigClassChange}
                        customSeparator={customSeparator}
                        setCustomSeparator={setCustomSeparator}
                        previewItems={previewClasses}
                        onPreviewItemsChange={setPreviewClasses}
                        listTitle="כיתות שזוהו"
                        onSave={() => handleRequestSave(() => saveToDb("classes", classCsvData, configClass))}
                        saveButtonText="עדכון טבלת הכיתות"
                        onNext={handleNext}
                        onPrev={handlePrev}
                        isLoading={isLoading}
                    />
                )}

                {/* Step 4: Subjects */}
                {step === 4 && (
                    <div className={styles.configSection}>
                        <h2 className={`${styles.title} ${styles.stepTitle}`}>רשימת מקצועות (שלב 4 מתוך 6)</h2>

                        <table className={styles.stepTable}>
                            <tbody>
                                <tr>
                                    {/* CONFIG (First column = Right in RTL) */}
                                    <td className={styles.cellConfig}>
                                        <div className={`${styles.formCard} ${styles.formCardWidth}`}>
                                            <h3 className={styles.sectionTitle}> הגדרות זיהוי לפי 2 הקבצים</h3>
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
                                                onClick={() => handleRequestSave(() => saveToDb("subjects", [], configTeacher, previewSubjects))}
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

                        <StepNavigation
                            onNext={handleNext}
                            onPrev={handlePrev}
                        />
                    </div>
                )}

                {/* Step 5: Verify (Work Groups) */}
                {step === 5 && (
                    <div className={styles.configSection}>
                        <h2 className={`${styles.title} ${styles.stepTitle}`}>קבוצות עבודה (שלב 5 מתוך 6)</h2>

                        <div className={styles.verifyContainer}>
                            <div className={styles.verifyListWrapper}>
                                <EditableList title="קבוצות עבודה" items={previewWorkGroups} onChange={(items) => setPreviewWorkGroups(items)} />
                            </div>
                            <div className={styles.updateButtonContainer}>
                                {/* Future: Save Work Groups */}
                                <SubmitBtn
                                    onClick={() => handleRequestSave(() => saveToDb("workGroups", [], configTeacher, previewWorkGroups))}
                                    buttonText="שמור קבוצות עבודה"
                                    className={styles.btnUpdate}
                                    isLoading={isLoading}
                                    type="button"
                                />
                            </div>
                        </div>
                        <StepNavigation
                            onNext={handleNext}
                            onPrev={handlePrev}
                        />
                    </div>
                )}
                {/* Step 6: Final Processing */}
                {step === 6 && (
                    <div className={styles.configSection}>
                        <h2 className={`${styles.title} ${styles.stepTitle}`}>בניית המערכת (שלב מסכם) (שלב 6 מתוך 6)</h2>

                        <table className={styles.stepTable}>
                            <tbody>
                                <tr>
                                    {/* CONFIG (Right) */}
                                    <td className={styles.cellConfig}>
                                        <div className={`${styles.formCard} ${styles.formCardWidth}`}>
                                            <h3 className={styles.sectionTitle}> הגדרות זיהוי בקובץ מערכת לפי מורים</h3>

                                            <DynamicInputSelect
                                                label="שורה בתא עבור כיתה"
                                                value={classLineInCell}
                                                onChange={(val) => setClassLineInCell(val)}
                                                options={[
                                                    { value: "first", label: "שורה ראשונה" },
                                                    { value: "2", label: "שורה שניה" },
                                                    { value: "last", label: "שורה אחרונה" }
                                                ]}
                                                placeholder="בחר שורה..."
                                            />
                                        </div>
                                    </td>

                                    {/* PREVIEW (Left) */}
                                    <td className={styles.cellList}>
                                        <div className={styles.previewColumn}>
                                            {/* Teacher Select */}
                                            <div className={styles.teacherSelectWrapper}>
                                                <DynamicInputSelect
                                                    placeholder="בחר מורה לתצוגה מקדימה"
                                                    options={dbTeachers.map(t => ({ value: t.id, label: t.name }))}
                                                    value={selectedTeacherId}
                                                    isBold={true}
                                                    onChange={(val) => setSelectedTeacherId(val)}
                                                />
                                            </div>

                                            {/* Grid Preview */}
                                            <div className={styles.previewContainer}>
                                                {selectedTeacherId && previewSchedule.length > 0 ? (
                                                    <table className={styles.previewTable}>
                                                        <thead>
                                                            <tr>
                                                                <th className={styles.tableHeader}>שעה / יום</th>
                                                                {["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי"].map(d => (
                                                                    <th key={d} className={styles.tableHeader}>{d}</th>
                                                                ))}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {Array.from({ length: Math.max(...previewSchedule.map(s => s.hour), 8) }).map((_, hourIdx) => {
                                                                const hour = hourIdx + 1;
                                                                return (
                                                                    <tr key={hour}>
                                                                        <td className={styles.hourCell}>{hour}</td>
                                                                        {[1, 2, 3, 4, 5, 6].map(day => {
                                                                            const cell = previewSchedule.find(s => s.day === day && s.hour === hour);
                                                                            const isValid = cell && cell.subjectId && cell.classId;
                                                                            const bgClass = cell ? (isValid ? styles.validCell : styles.invalidCell) : '';

                                                                            return (
                                                                                <td key={day} className={`${styles.dataCell} ${bgClass}`}>
                                                                                    {cell ? (
                                                                                        <div className={styles.cellContent}>
                                                                                            <span className={`${styles.subjectText} ${!isValid ? styles.textRed : ''}`}>{cell.subjectName || "?"}</span>
                                                                                            <span className={styles.classText}>{cell.className || "?"}</span>
                                                                                            {!isValid && <span className={styles.errorText}>לא זוהה</span>}
                                                                                        </div>
                                                                                    ) : null}
                                                                                </td>
                                                                            );
                                                                        })}
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                ) : (
                                                    <div className={styles.emptyStatePreview}>
                                                        {selectedTeacherId ? "אין נתונים להצגה (או לא זוהו)" : "בחר מורה לצפייה במערכת"}
                                                    </div>
                                                )}
                                            </div>

                                            <div className={styles.previewActions}>
                                                {selectedTeacherId && (
                                                    <SubmitBtn
                                                        onClick={() => handleRequestSave(handleSingleTeacherUpdate)}
                                                        buttonText={`עדכון מערכת למורה ${dbTeachers.find(t => t.id === selectedTeacherId)?.name || ""}`}
                                                        className={styles.btnSingleUpdate}
                                                        isLoading={isLoading}
                                                        type="button"
                                                    />
                                                )}
                                                <SubmitBtn
                                                    onClick={() => handleRequestSave(handleFinalUpdate)}
                                                    buttonText="עדכון כל המערכות"
                                                    className={styles.btnUpdate}
                                                    isLoading={isLoading}
                                                    type="button"
                                                />
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <StepNavigation
                            onNext={handleNext}
                            onPrev={handlePrev}
                            nextLabel="סיום"
                        />
                    </div>
                )}
                {/* Confirmation Popup */}
                <PopupModal
                    isOpen={isConfirmOpen}
                    onClose={() => setIsConfirmOpen(false)}
                    size="S"
                >
                    <div className={styles.modalContentWrapper}>
                        <h3 className={styles.modalText}>אישור עדכון</h3>
                        <p className={styles.modalMessage}>האם אתה בטוח שברצונך לעדכן את המערכת? פעולה זו תדרוס נתונים קיימים.</p>
                        <div className={styles.modalActions}>
                            <button
                                className={styles.modalBtnYes}
                                onClick={async () => {
                                    setIsConfirmOpen(false);
                                    if (confirmAction) await confirmAction();
                                }}
                            >
                                כן, עדכן
                            </button>
                            <button
                                className={styles.modalBtnNo}
                                onClick={() => setIsConfirmOpen(false)}
                            >
                                ביטול
                            </button>
                        </div>
                    </div>
                </PopupModal>
            </div>
        </AnnualImportPageLayout>
    );
};

export default AnnualImportPage;
