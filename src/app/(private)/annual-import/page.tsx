"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import AnnualImportPageLayout from "@/components/layout/pageLayouts/AnnualImportPageLayout/AnnualImportPageLayout";
import SubmitBtn from "@/components/ui/buttons/SubmitBtn/SubmitBtn";
import EditableList, { ListItem } from "./components/EditableList";
import StepNavigation from "./components/StepNavigation";
import DynamicInputSelect from "@/components/ui/select/InputSelect/DynamicInputSelect";
import { extractEntitiesFromFilesAction } from "@/app/actions/POST/import/extractEntitiesFromFilesAction";
import { fullSchedulePreviewAction } from "@/app/actions/POST/import/fullSchedulePreviewAction";
import { loadEntitiesFromDBAction } from "@/app/actions/POST/import/loadEntitiesFromDBAction";
import { syncAllEntityValuesAction, saveTeacherScheduleAction, addSingleEntityAction } from "../../actions/POST/import/syncDBimportAction";
import styles from "./page.module.css";
import { usePopup } from "@/context/PopupContext";
import MsgPopup from "@/components/popups/MsgPopup/MsgPopup";
import EditCellPopup from "./components/EditCellPopup";
import Preloader from "@/components/ui/Preloader/Preloader";
import { logErrorAction } from "@/app/actions/POST/logErrorAction";

interface ScheduleItem {
    teacher: string;
    class: string;
    subject: string;
    day: number;
    hour: number;
    originalText?: string;
}

interface AnalyzedData {
    teachers: ListItem[];
    classes: ListItem[];
    subjects: ListItem[];
    workGroups: ListItem[];
    schedule: ScheduleItem[];
    unmapped?: string[];
}

const AnnualImportContent = () => {
    const searchParams = useSearchParams();
    const schoolId = searchParams.get("schoolId");

    const [step, setStep] = useState(1);
    const [analyzedData, setAnalyzedData] = useState<AnalyzedData>({
        teachers: [],
        classes: [],
        subjects: [],
        workGroups: [],
        schedule: []
    });

    // Track where the data came from
    const [importSource, setImportSource] = useState<'AI' | 'DB'>('DB');
    const [teacherFile, setTeacherFile] = useState<File | null>(null);
    const [classFile, setClassFile] = useState<File | null>(null);
    const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const { openPopup } = usePopup();

    const popupMsg = (message: string) => {
        openPopup("msgPopup", "S", <MsgPopup message={message} />);
    };

    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        setFile: React.Dispatch<React.SetStateAction<File | null>>
    ) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.size > 10 * 1024 * 1024) {
                popupMsg("קובץ גדול מדי. נא להעלות קובץ עד 10MB");
                return;
            }
            setFile(selectedFile);
        }
    };

    // Phase 1: Fetch Existing Entities values from DB (if exists)
    const getEntityValuesFromDB = async () => {
        setIsLoading(true);
        setImportSource('DB');
        try {
            const formData = new FormData();
            if (schoolId) formData.append("schoolId", schoolId);

            const res = await loadEntitiesFromDBAction(formData);

            if (res.success && res.data) {
                setAnalyzedData(prev => ({
                    ...prev,
                    teachers: res.data!.teachers.map(t => ({ ...t, source: 'db' })),
                    classes: res.data!.classes.map(c => ({ ...c, source: 'db' })),
                    subjects: res.data!.subjects.map(s => ({ ...s, source: 'db' })),
                    workGroups: res.data!.workGroups.map(w => ({ ...w, source: 'db' })),
                    schedule: []
                }));
                setStep(2);
            } else {
                popupMsg(`שגיאה בטעינת נתונים:\n${res.message}`);
            }
        } catch (err) {
            logErrorAction({ description: `Error loading entities from DB (annual-import): ${err instanceof Error ? err.message : String(err)}`, schoolId: schoolId || undefined });
            popupMsg("שגיאה כללית בטעינת נתונים");
        } finally {
            setIsLoading(false);
        }
    };

    // Phase 2: Generate Teachers Final Schedule
    const DisplayTeachersFinalSchedule = async () => {
        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append("teacherFile", teacherFile!);
            formData.append("classFile", classFile!);
            if (schoolId) formData.append("schoolId", schoolId);

            // Prepare the approved lists (Map back to strings for the action)
            const entities = {
                teachers: analyzedData.teachers.map(t => t.name),
                classes: analyzedData.classes.map(c => c.name),
                workGroups: analyzedData.workGroups.map(w => w.name),
                subjects: analyzedData.subjects.map(s => s.name)
            };

            const res = await fullSchedulePreviewAction(formData, entities);

            if (res.success && res.data) {
                setAnalyzedData(prev => ({
                    ...prev,
                    schedule: res.data!.schedule,
                    unmapped: res.data!.unmapped
                }));
                // Auto-select first teacher if available
                if (analyzedData.teachers.length > 0) {
                    setSelectedTeacherId(analyzedData.teachers[0].name);
                }
                setStep(6); // Go to Preview
            } else {
                popupMsg(`שגיאה ביצירת המערכת:\n${res.message}`);
            }

        } catch (err) {
            logErrorAction({ description: `Error displaying teachers final schedule (annual-import): ${err instanceof Error ? err.message : String(err)}`, schoolId: schoolId || undefined });
            popupMsg("שגיאה ביצירת המערכת");
        } finally {
            setIsLoading(false);
        }
    };

    const handleNext = () => {
        if (step === 5) {
            DisplayTeachersFinalSchedule();
            return;
        }
        setStep(prev => prev + 1);
    };

    const handlePrev = () => setStep(prev => prev - 1);

    const handleRefresh = async (entityType: 'teachers' | 'classes' | 'subjects' | 'workGroups') => {
        setIsRefreshing(true);
        try {
            const formData = new FormData();
            formData.append("teacherFile", teacherFile!);
            formData.append("classFile", classFile!);
            if (schoolId) formData.append("schoolId", schoolId);

            // Pass known entities for cleaning
            formData.append("knownTeachers", JSON.stringify(analyzedData.teachers.map(t => t.name)));
            formData.append("knownClasses", JSON.stringify(analyzedData.classes.map(c => c.name)));

            setImportSource('AI');

            const res = await extractEntitiesFromFilesAction(formData, entityType);

            if (res.success && res.data) {
                const incomingData = res.data as { name: string, source: 'ai' | 'manual' }[];
                const currentItems = analyzedData[entityType] || [];
                const unmatchedDbItems = new Map<string, ListItem>();

                currentItems.forEach(item => {
                    const source = item.source || 'db';
                    if (source === 'db' || source === 'both' || source === 'manual') {
                        unmatchedDbItems.set(item.name, { ...item, source: 'db' });
                    }
                });

                const mergedList: ListItem[] = [];

                incomingData.forEach((item) => {
                    const { name, source } = item;
                    let finalSource: 'ai' | 'manual' | 'both' = source === 'ai' ? 'ai' : 'manual';
                    let matchedDbName = '';

                    // Try to match with DB items
                    if (unmatchedDbItems.has(name)) {
                        matchedDbName = name;
                    } else {
                        // Fuzzy Match (Substring)
                        for (const [dbName] of unmatchedDbItems) {
                            if (dbName.includes(name) || name.includes(dbName)) {
                                matchedDbName = dbName;
                                break;
                            }
                        }
                    }

                    if (matchedDbName) {
                        unmatchedDbItems.delete(matchedDbName);
                        // If found in file (AI or Manual) AND exists in DB -> 'both' (Verified)
                        finalSource = 'both';
                    }

                    mergedList.push({
                        name: name,
                        source: finalSource,
                        exists: finalSource !== 'ai' // Legacy support
                    });
                });

                // Add remaining DB items that weren't found in the file
                unmatchedDbItems.forEach(item => {
                    mergedList.push({ ...item, source: 'db', exists: true });
                });

                mergedList.sort((a, b) => a.name.localeCompare(b.name));

                setAnalyzedData(prev => ({
                    ...prev,
                    [entityType]: mergedList
                }));
            } else {
                popupMsg(`שגיאה ברענון: ${res.message}`);
            }
        } catch (err) {
            logErrorAction({ description: `Error refreshing entities (annual-import): ${err instanceof Error ? err.message : String(err)}`, schoolId: schoolId || undefined });
            popupMsg("שגיאה ברענון הנתונים");
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleSaveToDB = async (entityType: 'teachers' | 'classes' | 'subjects' | 'workGroups') => {
        setIsSaving(true);
        try {
            // Get current list from state
            const items = analyzedData[entityType].map(i => i.name);

            const res = await syncAllEntityValuesAction(schoolId || undefined, entityType, items);

            if (res.success) {
                popupMsg("הנתונים נשמרו בהצלחה למסד הנתונים!");
                setAnalyzedData(prev => ({
                    ...prev,
                    [entityType]: prev[entityType].map(item => ({
                        ...item,
                        exists: true,
                        source: 'db' // Update icon to DB icon
                    }))
                }));

            } else {
                popupMsg(`שגיאה בשמירה: ${res.message}`);
            }

        } catch (err) {
            logErrorAction({ description: `Error saving entities to DB (annual-import): ${err instanceof Error ? err.message : String(err)}`, schoolId: schoolId || undefined });
            popupMsg(`שגיאה בשמירה: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AnnualImportPageLayout>
            <div className={styles.container}>

                {/* Step 1: Upload */}
                {step === 1 && (
                    <div className={styles.stepContainer}>
                        <h2 className={`${styles.title} ${styles.stepTitle}`}>יבוא מערכת השעות - העלאת קבצים (שלב 1/6)</h2>

                        <div className={styles.uploadContainer}>
                            <div>
                                <h3 className={styles.subTitle}>קובץ מערכת לפי מורים</h3>
                                <input
                                    type="file"
                                    accept=".pdf, .docx, .xlsx, .csv"
                                    onChange={(e) => handleFileChange(e, setTeacherFile)}
                                    disabled={isLoading}
                                    className={styles.fileInput}
                                />
                                {teacherFile && <span className={styles.fileSuccess}>נבחר: {teacherFile.name}</span>}

                                <br /><br />
                                <h3 className={styles.subTitle}>קובץ מערכת לפי כיתות</h3>
                                <input
                                    type="file"
                                    accept=".pdf, .docx, .xlsx, .csv"
                                    onChange={(e) => handleFileChange(e, setClassFile)}
                                    disabled={isLoading}
                                    className={styles.fileInput}
                                />
                                {classFile && <span className={styles.fileSuccess}>נבחר: {classFile.name}</span>}
                            </div>
                        </div>

                        <div className={styles.actions}>
                            <SubmitBtn
                                type="button"
                                onClick={getEntityValuesFromDB}
                                buttonText="המשך"
                                className={styles.btnPrimary}
                                isLoading={isLoading}
                                disabled={!teacherFile || !classFile}
                            />
                        </div>
                    </div>
                )}

                {/* Step 2: Teachers */}
                {step === 2 && (
                    <div className={styles.stepContainer}>
                        <EditableList title="רשימת מורים (שלב 2/6)" items={analyzedData.teachers || []}
                            onSave={(items) => setAnalyzedData(prev => ({ ...prev, teachers: items }))}
                            onAddAndSave={async (newItemName) => {
                                const res = await addSingleEntityAction(schoolId || undefined, 'teachers', newItemName);
                                if (res.success && !res.alreadyExists) {
                                    // Update icon to 'db' for the newly added item
                                    setAnalyzedData(prev => ({
                                        ...prev,
                                        teachers: prev.teachers.map((item, idx) =>
                                            idx === prev.teachers.length - 1 ? { ...item, source: 'db' } : item
                                        )
                                    }));
                                }
                            }}
                            fromAI={importSource === 'AI'}
                        />
                        <StepNavigation
                            onNext={handleNext}
                            onPrev={handlePrev}
                            onRefresh={() => handleRefresh('teachers')}
                            onSaveToDB={() => handleSaveToDB('teachers')}
                            isRefreshing={isRefreshing}
                            isSaving={isSaving}
                            isLoading={isLoading}
                        />
                    </div>
                )}

                {/* Step 3: Classes */}
                {step === 3 && (
                    <div className={styles.stepContainer}>
                        <EditableList title="רשימת כיתות (שלב 3/6)" items={analyzedData.classes || []}
                            onSave={(items) => setAnalyzedData(prev => ({ ...prev, classes: items }))}
                            onAddAndSave={async (newItemName) => {
                                const res = await addSingleEntityAction(schoolId || undefined, 'classes', newItemName);
                                if (res.success && !res.alreadyExists) {
                                    setAnalyzedData(prev => ({
                                        ...prev,
                                        classes: prev.classes.map((item, idx) =>
                                            idx === prev.classes.length - 1 ? { ...item, source: 'db' } : item
                                        )
                                    }));
                                }
                            }}
                            fromAI={importSource === 'AI'}
                        />
                        <StepNavigation
                            onNext={handleNext}
                            onPrev={handlePrev}
                            onRefresh={() => handleRefresh('classes')}
                            onSaveToDB={() => handleSaveToDB('classes')}
                            isRefreshing={isRefreshing}
                            isSaving={isSaving}
                            isLoading={isLoading}
                        />
                    </div>
                )}

                {/* Step 4: Subjects */}
                {step === 4 && (
                    <div className={styles.stepContainer}>
                        <EditableList title="רשימת מקצועות (שלב 4/6)" items={analyzedData.subjects || []}
                            onSave={(items) => setAnalyzedData(prev => ({ ...prev, subjects: items }))}
                            onAddAndSave={async (newItemName) => {
                                const res = await addSingleEntityAction(schoolId || undefined, 'subjects', newItemName);
                                if (res.success && !res.alreadyExists) {
                                    setAnalyzedData(prev => ({
                                        ...prev,
                                        subjects: prev.subjects.map((item, idx) =>
                                            idx === prev.subjects.length - 1 ? { ...item, source: 'db' } : item
                                        )
                                    }));
                                }
                            }}
                            fromAI={importSource === 'AI'}
                        />
                        <StepNavigation
                            onNext={handleNext}
                            onPrev={handlePrev}
                            onRefresh={() => handleRefresh('subjects')}
                            onSaveToDB={() => handleSaveToDB('subjects')}
                            isRefreshing={isRefreshing}
                            isSaving={isSaving}
                            isLoading={isLoading}
                        />
                    </div>
                )}

                {/* Step 5: Work Groups */}
                {step === 5 && (
                    <div className={styles.stepContainer}>
                        <EditableList title="קבוצות עבודה (שלב 5/6)" items={analyzedData.workGroups || []}
                            onSave={(items) => setAnalyzedData(prev => ({ ...prev, workGroups: items }))}
                            onAddAndSave={async (newItemName) => {
                                const res = await addSingleEntityAction(schoolId || undefined, 'workGroups', newItemName);
                                if (res.success && !res.alreadyExists) {
                                    setAnalyzedData(prev => ({
                                        ...prev,
                                        workGroups: prev.workGroups.map((item, idx) =>
                                            idx === prev.workGroups.length - 1 ? { ...item, source: 'db' } : item
                                        )
                                    }));
                                }
                            }}
                            fromAI={importSource === 'AI'}
                        />
                        <StepNavigation
                            onNext={handleNext}
                            onPrev={handlePrev}
                            onRefresh={() => handleRefresh('workGroups')}
                            onSaveToDB={() => handleSaveToDB('workGroups')}
                            isRefreshing={isRefreshing}
                            isSaving={isSaving}
                            isLoading={isLoading}
                        />
                    </div>
                )}

                {/* Step 6: Final Processing */}
                {step === 6 && (
                    <div className={styles.configSection}>
                        <h2 className={`${styles.title} ${styles.stepTitle}`}>בדיקת ושמירת המערכות (שלב 6 מתוך 6)</h2>

                        <div className={styles.previewColumn}>
                            {/* Unmapped Items Warning */}
                            {analyzedData.unmapped && analyzedData.unmapped.length > 0 && (
                                <div className={styles.warningBox}>
                                    <strong>שים לב:</strong> {analyzedData.unmapped.length} שורות בקובץ לא זוהו כחלק מהמערכת (בדוק לוגים לפרטים).
                                </div>
                            )}

                            {/* Teacher Select with Navigation */}
                            <div className={styles.teacherSelectWrapper}>
                                <button
                                    type="button"
                                    className={styles.navArrow}
                                    onClick={() => {
                                        if (!selectedTeacherId) return;
                                        const currentIndex = analyzedData.teachers.findIndex(t => t.name === selectedTeacherId);
                                        if (currentIndex > 0) {
                                            setSelectedTeacherId(analyzedData.teachers[currentIndex - 1].name);
                                        }
                                    }}
                                    disabled={!selectedTeacherId || analyzedData.teachers.findIndex(t => t.name === selectedTeacherId) === 0}
                                    aria-label="מורה קודם"
                                >
                                    ❮
                                </button>
                                <DynamicInputSelect
                                    placeholder="בחרו מורה..."
                                    options={analyzedData.teachers.map(t => ({ value: t.name, label: t.name }))}
                                    value={selectedTeacherId || ""}
                                    onChange={(val) => setSelectedTeacherId(val)}
                                    isBold={true}
                                />
                                <button
                                    type="button"
                                    className={styles.navArrow}
                                    onClick={() => {
                                        if (!selectedTeacherId) return;
                                        const currentIndex = analyzedData.teachers.findIndex(t => t.name === selectedTeacherId);
                                        if (currentIndex < analyzedData.teachers.length - 1) {
                                            setSelectedTeacherId(analyzedData.teachers[currentIndex + 1].name);
                                        }
                                    }}
                                    disabled={!selectedTeacherId || analyzedData.teachers.findIndex(t => t.name === selectedTeacherId) === analyzedData.teachers.length - 1}
                                    aria-label="מורה הבא"
                                >
                                    ❯
                                </button>
                            </div>

                            {/* Grid Preview */}
                            <div className={styles.previewContainer}>
                                {selectedTeacherId ? (
                                    (() => {
                                        const teacherSchedule = analyzedData.schedule.filter(s => s.teacher === selectedTeacherId);
                                        if (teacherSchedule.length === 0) {
                                            return <div className={styles.emptyStatePreview}>אין שיעורים למורה זה</div>;
                                        }

                                        const maxHour = Math.max(...teacherSchedule.map(s => s.hour), 8);

                                        return (
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
                                                    {Array.from({ length: maxHour }).map((_, hourIdx) => {
                                                        const hour = hourIdx + 1;
                                                        return (
                                                            <tr key={hour}>
                                                                <td className={styles.hourCell}>{hour}</td>
                                                                {[1, 2, 3, 4, 5, 6].map(day => {
                                                                    const cell = teacherSchedule.find(s => s.day === day && s.hour === hour);
                                                                    const checkValidity = () => {
                                                                        if (!cell) return false;
                                                                        // Basic check
                                                                        const basicValid = cell.subject && cell.class &&
                                                                            !cell.subject.includes("Unknown") &&
                                                                            !cell.class.includes("Unknown");

                                                                        if (!basicValid) return false;

                                                                        // Mark "No Subject" as invalid (Red)
                                                                        if (cell.subject === "ללא מקצוע") return false;

                                                                        // If it's a Work Group (class="קבוצה"), we ignore conflicts intentionally.
                                                                        if (cell.class === "קבוצה") return true;

                                                                        // Partial Match Check (Secondary Subject Detection)
                                                                        // We only flag RED if the leftovers contain ANOTHER known subject.
                                                                        if (cell.originalText && cell.subject) {
                                                                            const leftovers = cell.originalText.replace(cell.subject, "");

                                                                            const hasAnotherSubject = analyzedData.subjects.some(subj => {
                                                                                if (subj.name === cell.subject) return false;
                                                                                if (subj.name.length < 2) return false;
                                                                                return leftovers.includes(subj.name);
                                                                            });

                                                                            if (hasAnotherSubject) return false;
                                                                        }
                                                                        return true;
                                                                    };

                                                                    const isValid = checkValidity();
                                                                    const bgClass = cell && !isValid ? styles.invalidCell : '';

                                                                    const handleCellClick = () => {
                                                                        if (!cell) return;

                                                                        // Format info text
                                                                        const infoText = `${cell.teacher}, יום ${["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי"][cell.day - 1]}, שעה ${cell.hour}\n${cell.originalText || "ללא מידע מקורי"}`;

                                                                        openPopup("editImportCell", "S", (
                                                                            <EditCellPopup
                                                                                infoText={infoText}
                                                                                initialSubject={cell.subject === "ללא מקצוע" ? "" : (cell.subject || "")}
                                                                                initialClass={cell.class === "ללא כיתה" ? "" : (cell.class || "")}
                                                                                onSave={(newSubject, newClass) => {
                                                                                    setAnalyzedData(prev => ({
                                                                                        ...prev,
                                                                                        schedule: prev.schedule.map(s => {
                                                                                            if (s.teacher === cell.teacher && s.day === cell.day && s.hour === cell.hour) {
                                                                                                return { ...s, subject: newSubject || "ללא מקצוע", class: newClass || "ללא כיתה" };
                                                                                            }
                                                                                            return s;
                                                                                        })
                                                                                    }));
                                                                                }}
                                                                            />
                                                                        ));
                                                                    };

                                                                    return (
                                                                        <td
                                                                            key={day}
                                                                            className={`${styles.dataCell} ${bgClass}`}
                                                                            onClick={handleCellClick}
                                                                            style={{ cursor: cell ? 'pointer' : 'default' }}
                                                                        >
                                                                            {cell ? (
                                                                                <div className={styles.cellContent}>
                                                                                    <span className={`${styles.subjectText} ${!isValid ? styles.textRed : ''}`}>
                                                                                        {cell.subject?.replace("Unknown", "?") || "?"}
                                                                                    </span>
                                                                                    <span className={styles.classText}>
                                                                                        {cell.class?.replace("Unknown", "?") || "?"}
                                                                                    </span>
                                                                                    {cell.subject === "ללא מקצוע" && cell.originalText && (
                                                                                        <span className={styles.originalTextHint}>
                                                                                            ({cell.originalText})
                                                                                        </span>
                                                                                    )}
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
                                        );
                                    })()
                                ) : (
                                    <div className={styles.emptyStatePreview}>
                                        בחירת מורה
                                    </div>
                                )}
                            </div>

                            <div className={styles.previewActions} style={{ justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    {selectedTeacherId && (
                                        <SubmitBtn
                                            onClick={async () => {
                                                const scheduleItems = analyzedData.schedule
                                                    .filter(s => s.teacher === selectedTeacherId)
                                                    .map(s => ({
                                                        day: s.day,
                                                        hour: s.hour,
                                                        className: s.class,
                                                        subjectName: s.subject
                                                    }));

                                                const res = await saveTeacherScheduleAction(
                                                    selectedTeacherId,
                                                    schoolId || '',
                                                    scheduleItems
                                                );
                                                popupMsg(res.message);
                                            }}
                                            buttonText={`הוספת המערכת`}
                                            className={styles.btnSingleUpdate}
                                            isLoading={isLoading}
                                            type="button"
                                        />
                                    )}
                                </div>

                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button type="button" onClick={handlePrev} className={styles.modalBtnNo}>הקודם</button>
                                    <button
                                        type="button"
                                        onClick={() => window.location.href = '/'}
                                        className={styles.btnPrimary}
                                    >
                                        סיום
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </AnnualImportPageLayout>
    );
};

const AnnualImportPage = () => {
    return (
        <React.Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', marginTop: '20vh' }}><Preloader /></div>}>
            <AnnualImportContent />
        </React.Suspense>
    );
};

export default AnnualImportPage;
