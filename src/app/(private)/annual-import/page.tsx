"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import AnnualImportPageLayout from "@/components/layout/pageLayouts/AnnualImportPageLayout/AnnualImportPageLayout";
import SubmitBtn from "@/components/ui/buttons/SubmitBtn/SubmitBtn";
import EditableList, { ListItem } from "./components/EditableList";
import StepNavigation from "./components/StepNavigation";
import DynamicInputSelect from "@/components/ui/select/InputSelect/DynamicInputSelect";
import { extractEntitiesFromExcelAction } from "@/app/actions/POST/import/extractEntitiesFromExcelAction";
import { extractEntitiesFromWordAction } from "@/app/actions/POST/import/extractEntitiesFromWordAction";
import { fullSchedulePreviewAction } from "@/app/actions/POST/import/fullSchedulePreviewAction";
import { loadEntitiesFromDBAction } from "@/app/actions/POST/import/loadEntitiesFromDBAction";
import { syncAllEntityValuesAction } from "@/app/actions/POST/import/syncDBimportAction";
import { saveTeacherScheduleAction, saveAllTeachersSchedulesAction } from "@/app/actions/POST/import/syncDBimportAction";
import { addSingleEntityAction } from "@/app/actions/POST/import/syncDBimportAction";
import styles from "./page.module.css";
import Icons from "@/style/icons";
import { usePopup } from "@/context/PopupContext";
import MsgPopup from "@/components/popups/MsgPopup/MsgPopup";
import EditCellPopup from "./components/EditCellPopup";
import Preloader from "@/components/ui/Preloader/Preloader";
import { logErrorAction } from "@/app/actions/POST/logErrorAction";
import { checkTeacherHasScheduleAction } from "@/app/actions/GET/checkTeacherHasScheduleAction";
import { useOptionalMainContext } from "@/context/MainContext";

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

    // File mode: Excel or Word
    const [fileMode, setFileMode] = useState<'excel' | 'word'>('excel');

    // Excel files
    const [teacherFile, setTeacherFile] = useState<File | null>(null);
    const [classFile, setClassFile] = useState<File | null>(null);

    // Word files (new flow)
    const [teacherWordFile, setTeacherWordFile] = useState<File | null>(null);
    const [classWordFile, setClassWordFile] = useState<File | null>(null);
    const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
    const [teacherHasExistingSchedule, setTeacherHasExistingSchedule] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [mergeAliases, setMergeAliases] = useState<Record<string, string>>({});

    const handleEntityMerge = (discardedName: string, keptName: string) => {
        setMergeAliases(prev => ({
            ...prev,
            [discardedName]: keptName
        }));
    };
    const [isSavingAll, setIsSavingAll] = useState(false);
    const { openPopup } = usePopup();
    const mainContext = useOptionalMainContext();

    const popupMsg = (message: string) => {
        openPopup("msgPopup", "S", <MsgPopup message={message} />);
    };

    // Check if selected teacher already has a schedule in DB
    useEffect(() => {
        if (!selectedTeacherId || !schoolId) {
            setTeacherHasExistingSchedule(false);
            return;
        }

        const checkSchedule = async () => {
            const hasSchedule = await checkTeacherHasScheduleAction(selectedTeacherId, schoolId);
            setTeacherHasExistingSchedule(hasSchedule);
        };

        checkSchedule();
    }, [selectedTeacherId, schoolId]);

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
    // Then, if Word mode, also extract entities from Word files and merge with DB data
    const getEntityValuesFromDB = async () => {
        setIsLoading(true);
        try {
            const formData = new FormData();
            if (schoolId) formData.append("schoolId", schoolId);

            const res = await loadEntitiesFromDBAction(formData);

            if (!res.success || !res.data) {
                popupMsg(`שגיאה בטעינת נתונים:\n${res.message}`);
                return;
            }

            // Base data from DB
            let teachers: ListItem[] = res.data.teachers.map(t => ({ ...t, source: 'db' as ListItem['source'] }));
            let classes: ListItem[] = res.data.classes.map(c => ({ ...c, source: 'db' as ListItem['source'] }));
            let subjects: ListItem[] = res.data.subjects.map(s => ({ ...s, source: 'db' as ListItem['source'] }));
            let workGroups: ListItem[] = res.data.workGroups.map(w => ({ ...w, source: 'db' as ListItem['source'] }));

            // Helper for merging extracted file entities with DB entities
            const mergeEntities = (
                extracted: { teachers: string[]; classes: string[]; subjects: string[]; workGroups: string[] }
            ) => {
                const dbTeacherMap = new Map(teachers.map(t => [t.name, t]));
                const dbClassMap = new Map(classes.map(c => [c.name, c]));

                // Helper to clean quotes and whitespace for exact matching
                const cleanForEntity = (s: string) => s.replace(/\s*[\(\[]\s*[שפ]\s*[\)\]]/g, "").replace(/['"״׳\u05F4\u05F3\u201C\u201D\u2018\u2019]/g, "").replace(/\s+/g, " ").trim();

                // Merge teachers from file with DB teachers
                const mergedTeachers: typeof teachers = [];
                const seenTeachers = new Set<string>();

                extracted.teachers.forEach(name => {
                    const cleanName = cleanForEntity(name);
                    if (seenTeachers.has(cleanName)) return;
                    seenTeachers.add(cleanName);

                    const nameWords = cleanName.split(" ").filter(Boolean);

                    // Try exact match first, then multi-word match (e.g. "אלזס בתיה" <-> "בתיה אלזס")
                    let dbMatch: string | undefined;
                    if (dbTeacherMap.has(name)) {
                        dbMatch = name;
                    } else {
                        for (const [dbName] of dbTeacherMap) {
                            const cleanDb = cleanForEntity(dbName);
                            if (cleanDb === cleanName) {
                                dbMatch = dbName;
                                break;
                            }
                            const dbWords = cleanDb.split(" ").filter(Boolean);
                            if (nameWords.length >= 2 && dbWords.length === nameWords.length) {
                                if (nameWords.slice().sort().join(" ") === dbWords.slice().sort().join(" ")) {
                                    dbMatch = dbName;
                                    break;
                                }
                            }
                        }
                    }

                    if (dbMatch) {
                        dbTeacherMap.delete(dbMatch);
                        mergedTeachers.push({ name: dbMatch, source: 'both', exists: true });
                    } else {
                        mergedTeachers.push({ name, source: 'file', exists: false });
                    }
                });

                // Add remaining DB teachers that weren't in file
                dbTeacherMap.forEach(item => mergedTeachers.push({ ...item, source: 'db', exists: true }));
                teachers = mergedTeachers; // Preserve original file order

                // Helper to clean/normalize class name for matching (e.g. "א'1", "כיתה א1", "א 1" -> "א1")
                const cleanForMatch = (s: string) => s.replace(/^(כיתה|כיתת|שכבת)\s+/g, "").replace(/['"״׳\u05F4\u05F3\u201C\u201D\u2018\u2019\s]/g, "").trim();

                // Format raw name into standard "כיתה X" (e.g. "א1" / "א'1" -> "כיתה א1")
                const formatStandardClassName = (raw: string) => {
                    const cleaned = raw.replace(/^(כיתה|כיתת|שכבת)\s+/g, "").replace(/['"״׳\u05F4\u05F3\u201C\u201D\u2018\u2019]/g, "").replace(/\s+/g, " ").trim();
                    return `כיתה ${cleaned}`;
                };

                // Merge classes from file with DB classes
                const mergedClasses: typeof classes = [];
                const seenClasses = new Set<string>();

                extracted.classes.forEach(name => {
                    const stdName = formatStandardClassName(name);
                    if (seenClasses.has(stdName)) return;
                    seenClasses.add(stdName);

                    const matchKey = cleanForMatch(name);

                    let dbMatch: string | undefined;
                    if (dbClassMap.has(stdName)) {
                        dbMatch = stdName;
                    } else {
                        for (const [dbName] of dbClassMap) {
                            if (cleanForMatch(dbName) === matchKey) {
                                dbMatch = dbName;
                                break;
                            }
                        }
                    }

                    if (dbMatch) {
                        dbClassMap.delete(dbMatch);
                        mergedClasses.push({ name: dbMatch, source: 'both', exists: true });
                    } else {
                        mergedClasses.push({ name: stdName, source: 'file', exists: false });
                    }
                });

                // Add remaining DB classes
                dbClassMap.forEach(item => mergedClasses.push({ ...item, source: 'db', exists: true }));
                classes = mergedClasses.sort((a, b) => a.name.localeCompare(b.name, 'he'));

                // Helper to match subject or workgroup names between file and DB
                const findEntityDbMatch = (cleanName: string, dbMap: Map<string, any>) => {
                    if (dbMap.has(cleanName)) return cleanName;
                    const candWords = cleanName.split(" ").filter(Boolean);

                    // 1. Exact cleaned match
                    for (const [dbName] of dbMap) {
                        const cleanDb = cleanForEntity(dbName);
                        if (cleanDb === cleanName) return dbName;
                    }

                    // 2. Prefix / Stem match (e.g. "חשיבה חיובי" <-> "חשיבה חיובית", "ארוחת צהרי" <-> "ארוחת צהרים")
                    for (const [dbName] of dbMap) {
                        const cleanDb = cleanForEntity(dbName);
                        if (
                            (cleanDb.startsWith(cleanName) && cleanName.length >= 4) ||
                            (cleanName.startsWith(cleanDb) && cleanDb.length >= 4)
                        ) {
                            return dbName;
                        }

                        // Word-level prefix match (e.g. "חשיבה חיובי" vs "חשיבה חיובית")
                        const dbWords = cleanDb.split(" ").filter(Boolean);
                        if (candWords.length === dbWords.length && candWords.length >= 2) {
                            const isMatch = candWords.every((w, idx) => {
                                const dbW = dbWords[idx];
                                return w === dbW || dbW.startsWith(w) || w.startsWith(dbW);
                            });
                            if (isMatch) return dbName;
                        }
                    }

                    return undefined;
                };

                // Merge subjects from file with DB subjects
                const mergedSubjects: typeof subjects = [];
                const seenSubjects = new Set<string>();
                const dbSubjectMap = new Map(subjects.map(s => [s.name, s]));

                extracted.subjects.forEach(name => {
                    const cleanName = cleanForEntity(name);
                    if (seenSubjects.has(cleanName)) return;
                    seenSubjects.add(cleanName);

                    const dbMatch = findEntityDbMatch(cleanName, dbSubjectMap);

                    if (dbMatch) {
                        dbSubjectMap.delete(dbMatch);
                        const hasQuotes = name.includes('"') || name.includes("'");
                        const dbHasQuotes = dbMatch.includes('"') || dbMatch.includes("'");
                        const finalName = (hasQuotes && !dbHasQuotes) ? name : dbMatch;
                        mergedSubjects.push({ name: finalName, source: 'both', exists: true });
                    } else {
                        mergedSubjects.push({ name, source: 'file', exists: false });
                    }
                });

                dbSubjectMap.forEach(item => mergedSubjects.push({ ...item, source: 'db', exists: true }));
                subjects = mergedSubjects.sort((a, b) => a.name.localeCompare(b.name, 'he'));

                // Merge workGroups from file with DB workGroups
                const mergedWorkGroups: typeof workGroups = [];
                const seenWorkGroups = new Set<string>();
                const dbWorkGroupMap = new Map(workGroups.map(w => [w.name, w]));

                extracted.workGroups.forEach(name => {
                    const cleanName = cleanForEntity(name);
                    if (seenWorkGroups.has(cleanName)) return;
                    seenWorkGroups.add(cleanName);

                    const dbMatch = findEntityDbMatch(cleanName, dbWorkGroupMap);

                    if (dbMatch) {
                        dbWorkGroupMap.delete(dbMatch);
                        const cleanDbMatch = dbMatch.replace(/\s*[\(\[]\s*[שפ]\s*[\)\]]/g, "").trim();
                        const hasQuotes = name.includes('"') || name.includes("'");
                        const dbHasQuotes = cleanDbMatch.includes('"') || cleanDbMatch.includes("'");
                        const finalName = (hasQuotes && !dbHasQuotes) ? name : cleanDbMatch;
                        mergedWorkGroups.push({ name: finalName, source: 'both', exists: true });
                    } else {
                        mergedWorkGroups.push({ name, source: 'file', exists: false });
                    }
                });

                dbWorkGroupMap.forEach(item => {
                    const cleanName = item.name.replace(/\s*[\(\[]\s*[שפ]\s*[\)\]]/g, "").trim();
                    mergedWorkGroups.push({ ...item, name: cleanName, source: 'db', exists: true });
                });
                workGroups = mergedWorkGroups.sort((a, b) => a.name.localeCompare(b.name, 'he'));
            };

            // --- Excel mode: extract from Excel files and merge ---
            if (fileMode === 'excel' && teacherFile && classFile) {
                const excelFormData = new FormData();
                excelFormData.append("teacherFile", teacherFile);
                excelFormData.append("classFile", classFile);
                if (schoolId) excelFormData.append("schoolId", schoolId);

                const excelRes = await extractEntitiesFromExcelAction(excelFormData);
                if (excelRes.success && excelRes.data) {
                    mergeEntities(excelRes.data);
                } else {
                    popupMsg(`שגיאה בקריאת קבצי Excel:\n${excelRes.message}`);
                    return;
                }
            }

            // --- Word mode: extract from Word files and merge ---
            if (fileMode === 'word' && teacherWordFile && classWordFile) {
                const wordFormData = new FormData();
                wordFormData.append("teacherWordFile", teacherWordFile);
                wordFormData.append("classWordFile", classWordFile);
                if (schoolId) wordFormData.append("schoolId", schoolId);

                const wordRes = await extractEntitiesFromWordAction(wordFormData);
                if (wordRes.success && wordRes.data) {
                    mergeEntities(wordRes.data);
                } else {
                    popupMsg(`שגיאה בקריאת קבצי Word:\n${wordRes.message}`);
                    return;
                }
            }

            setAnalyzedData(prev => ({
                ...prev,
                teachers,
                classes,
                subjects,
                workGroups,
                schedule: []
            }));
            setStep(2);

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
            if (fileMode === 'word') {
                formData.append("teacherWordFile", teacherWordFile!);
                formData.append("classWordFile", classWordFile!);
            } else {
                formData.append("teacherFile", teacherFile!);
                formData.append("classFile", classFile!);
            }
            if (schoolId) formData.append("schoolId", schoolId);
            formData.append("aliases", JSON.stringify(mergeAliases));

            // Prepare only the active approved lists for this year
            const entities = {
                teachers: analyzedData.teachers.filter(t => t.source !== 'db').map(t => t.name),
                classes: analyzedData.classes.filter(c => c.source !== 'db').map(c => c.name),
                workGroups: analyzedData.workGroups.filter(w => w.source !== 'db').map(w => w.name),
                subjects: analyzedData.subjects.filter(s => s.source !== 'db').map(s => s.name)
            };

            const res = await fullSchedulePreviewAction(formData, entities);

            if (res.success && res.data) {
                setAnalyzedData(prev => ({
                    ...prev,
                    schedule: res.data!.schedule,
                    unmapped: res.data!.unmapped
                }));
                // Auto-select first teacher who actually has a schedule
                const activeTeachers = analyzedData.teachers.filter(t =>
                    res.data!.schedule.some(s => s.teacher === t.name)
                );
                if (activeTeachers.length > 0) {
                    setSelectedTeacherId(activeTeachers[0].name);
                } else if (analyzedData.teachers.length > 0) {
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

    const handleNext = async () => {
        // Auto-save current step's approved items to DB before moving forward
        const entityTypeMap: Record<number, 'teachers' | 'classes' | 'subjects' | 'workGroups'> = {
            2: 'teachers',
            3: 'classes',
            4: 'subjects',
            5: 'workGroups'
        };
        const currentType = entityTypeMap[step];
        if (currentType && analyzedData[currentType]) {
            const activeItems = analyzedData[currentType]
                .filter(i => i.source !== 'db')
                .map(i => i.name);
            void syncAllEntityValuesAction(schoolId || undefined, currentType, activeItems);
        }

        if (step === 5) {
            DisplayTeachersFinalSchedule();
            return;
        }

        if (fileMode === 'word' && teacherWordFile && classWordFile) {
            setIsLoading(true);
            try {
                const wordFormData = new FormData();
                wordFormData.append("teacherWordFile", teacherWordFile);
                wordFormData.append("classWordFile", classWordFile);
                if (schoolId) wordFormData.append("schoolId", schoolId);

                const wordRes = await extractEntitiesFromWordAction(wordFormData);

                if (wordRes.success && wordRes.data) {
                    const dbRes = await loadEntitiesFromDBAction(wordFormData);
                    if (dbRes.success && dbRes.data) {
                        if (step === 2) {
                            // Extract and merge classes (Step 3 target)
                            const cleanForMatch = (s: string) => s.replace(/^(כיתה|כיתת|שכבת)\s+/g, "").replace(/['"״׳\u05F4\u05F3\u201C\u201D\u2018\u2019\s]/g, "").trim();
                            const formatStandardClassName = (raw: string) => {
                                const cleaned = raw.replace(/^(כיתה|כיתת|שכבת)\s+/g, "").replace(/['"״׳\u05F4\u05F3\u201C\u201D\u2018\u2019]/g, "").replace(/\s+/g, " ").trim();
                                return `כיתה ${cleaned}`;
                            };

                            const dbClasses = dbRes.data.classes.map(c => ({ ...c, source: 'db' as ListItem['source'] }));
                            const dbClassMap = new Map(dbClasses.map(c => [c.name, c]));
                            const mergedClasses: ListItem[] = [];
                            const seenClasses = new Set<string>();

                            wordRes.data.classes.forEach(name => {
                                const stdName = formatStandardClassName(name);
                                if (seenClasses.has(stdName)) return;
                                seenClasses.add(stdName);

                                const matchKey = cleanForMatch(name);

                                let dbMatch: string | undefined;
                                if (dbClassMap.has(stdName)) {
                                    dbMatch = stdName;
                                } else {
                                    for (const [dbName] of dbClassMap) {
                                        if (cleanForMatch(dbName) === matchKey) {
                                            dbMatch = dbName;
                                            break;
                                        }
                                    }
                                }

                                if (dbMatch) {
                                    dbClassMap.delete(dbMatch);
                                    mergedClasses.push({ name: dbMatch, source: 'both', exists: true });
                                } else {
                                    mergedClasses.push({ name: stdName, source: 'file', exists: false });
                                }
                            });

                            dbClassMap.forEach(item => mergedClasses.push({ ...item, source: 'db', exists: true }));
                            const sortedClasses = mergedClasses.sort((a, b) => a.name.localeCompare(b.name, 'he'));

                            setAnalyzedData(prev => ({ ...prev, classes: sortedClasses }));
                        } else if (step === 3) {
                            // Step 3 (Classes) -> moving to Step 4 (WorkGroups target)
                            const cleanForEntity = (s: string) => s.replace(/['"״׳\u05F4\u05F3\u201C\u201D\u2018\u2019]/g, "").replace(/\s+/g, " ").trim();
                            const dbWorkGroups = dbRes.data.workGroups.map(w => ({ ...w, source: 'db' as ListItem['source'] }));
                            const dbWorkGroupMap = new Map(dbWorkGroups.map(w => [w.name, w]));
                            const mergedWorkGroups: ListItem[] = [];
                            const seenWorkGroups = new Set<string>();

                            wordRes.data.workGroups.forEach(name => {
                                const cleanName = cleanForEntity(name);
                                if (seenWorkGroups.has(cleanName)) return;
                                seenWorkGroups.add(cleanName);

                                let dbMatch: string | undefined;
                                if (dbWorkGroupMap.has(name)) {
                                    dbMatch = name;
                                } else {
                                    for (const [dbName] of dbWorkGroupMap) {
                                        if (cleanForEntity(dbName) === cleanName) {
                                            dbMatch = dbName;
                                            break;
                                        }
                                    }
                                }

                                if (dbMatch) {
                                    dbWorkGroupMap.delete(dbMatch);
                                    mergedWorkGroups.push({ name: dbMatch, source: 'both', exists: true });
                                } else {
                                    mergedWorkGroups.push({ name, source: 'file', exists: false });
                                }
                            });

                            dbWorkGroupMap.forEach(item => mergedWorkGroups.push({ ...item, source: 'db', exists: true }));
                            const sortedWorkGroups = mergedWorkGroups.sort((a, b) => a.name.localeCompare(b.name, 'he'));

                            setAnalyzedData(prev => ({ ...prev, workGroups: sortedWorkGroups }));
                        } else if (step === 4) {
                            // Step 4 (WorkGroups) -> moving to Step 5 (Subjects target)
                            const cleanForEntity = (s: string) => s.replace(/['"״׳\u05F4\u05F3\u201C\u201D\u2018\u2019]/g, "").replace(/\s+/g, " ").trim();
                            const dbSubjects = dbRes.data.subjects.map(s => ({ ...s, source: 'db' as ListItem['source'] }));
                            const dbSubjectMap = new Map(dbSubjects.map(s => [s.name, s]));
                            const mergedSubjects: ListItem[] = [];
                            const seenSubjects = new Set<string>();

                            wordRes.data.subjects.forEach(name => {
                                const cleanName = cleanForEntity(name);
                                if (seenSubjects.has(cleanName)) return;
                                seenSubjects.add(cleanName);

                                let dbMatch: string | undefined;
                                if (dbSubjectMap.has(name)) {
                                    dbMatch = name;
                                } else {
                                    for (const [dbName] of dbSubjectMap) {
                                        if (cleanForEntity(dbName) === cleanName) {
                                            dbMatch = dbName;
                                            break;
                                        }
                                    }
                                }

                                if (dbMatch) {
                                    dbSubjectMap.delete(dbMatch);
                                    mergedSubjects.push({ name: dbMatch, source: 'both', exists: true });
                                } else {
                                    mergedSubjects.push({ name, source: 'file', exists: false });
                                }
                            });

                            dbSubjectMap.forEach(item => mergedSubjects.push({ ...item, source: 'db', exists: true }));
                            const sortedSubjects = mergedSubjects.sort((a, b) => a.name.localeCompare(b.name, 'he'));

                            setAnalyzedData(prev => ({ ...prev, subjects: sortedSubjects }));
                        }
                    }
                }
            } catch (err) {
                console.error("Error during step transition re-extraction:", err);
            } finally {
                setIsLoading(false);
            }
        }

        setStep(prev => prev + 1);
    };

    const handlePrev = () => setStep(prev => prev - 1);

    const handleSaveToDB = async (entityType: 'teachers' | 'classes' | 'subjects' | 'workGroups') => {
        setIsSaving(true);
        try {
            // Get active items for the new year (exclude DB-only items that were not found in the new file)
            const activeItems = analyzedData[entityType]
                .filter(i => i.source !== 'db')
                .map(i => i.name);

            const res = await syncAllEntityValuesAction(schoolId || undefined, entityType, activeItems);

            if (res.success) {
                setAnalyzedData(prev => ({
                    ...prev,
                    [entityType]: prev[entityType].map(item => ({
                        ...item,
                        exists: item.source !== 'db',
                        source: item.source === 'db' ? 'db' : 'both'
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

                        {/* File mode radio selection */}
                        <div className={styles.fileModeSection}>
                            <label className={styles.fileModeLabel}>פורמט הקבצים לייבוא:</label>
                            <div className={styles.fileModeRadioGroup} role="radiogroup">
                                <label
                                    className={`${styles.fileModeRadioCard} ${fileMode === 'excel' ? styles.fileModeRadioCardActive : ''}`}
                                    onClick={() => { if (!isLoading) { setFileMode('excel'); setTeacherWordFile(null); setClassWordFile(null); } }}
                                >
                                    <input
                                        type="radio"
                                        name="fileMode"
                                        value="excel"
                                        checked={fileMode === 'excel'}
                                        onChange={() => { setFileMode('excel'); setTeacherWordFile(null); setClassWordFile(null); }}
                                        className={styles.fileModeRadioInput}
                                        disabled={isLoading}
                                    />
                                    <span className={styles.radioCustomCircle} />
                                    <span className={styles.radioIcon}>📊</span>
                                    <div className={styles.radioTextWrapper}>
                                        <span className={styles.radioTitle}>Excel (.xlsx)</span>
                                        <span className={styles.radioSubtitle}>קובצי אקסל של מורים וכיתות</span>
                                    </div>
                                </label>

                                <label
                                    className={`${styles.fileModeRadioCard} ${fileMode === 'word' ? styles.fileModeRadioCardActive : ''}`}
                                    onClick={() => { if (!isLoading) { setFileMode('word'); setTeacherFile(null); setClassFile(null); } }}
                                >
                                    <input
                                        type="radio"
                                        name="fileMode"
                                        value="word"
                                        checked={fileMode === 'word'}
                                        onChange={() => { setFileMode('word'); setTeacherFile(null); setClassFile(null); }}
                                        className={styles.fileModeRadioInput}
                                        disabled={isLoading}
                                    />
                                    <span className={styles.radioCustomCircle} />
                                    <span className={styles.radioIcon}>📄</span>
                                    <div className={styles.radioTextWrapper}>
                                        <span className={styles.radioTitle}>Word (.docx)</span>
                                        <span className={styles.radioSubtitle}>טבלאות שעות בקובצי וורד</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Excel (.xlsx) inputs */}
                        {fileMode === 'excel' && (
                            <div className={styles.uploadContainer}>
                                <div>
                                    <h3 className={styles.subTitle}>קובץ מערכת לפי כיתות (.xlsx)</h3>
                                    <input
                                        type="file"
                                        id="class-excel-input"
                                        accept=".xlsx, .xls"
                                        onChange={(e) => handleFileChange(e, setClassFile)}
                                        disabled={isLoading}
                                        className={styles.fileInput}
                                    />
                                    {classFile && <span className={styles.fileSuccess}>נבחר: {classFile.name}</span>}

                                    <br /><br />
                                    <h3 className={styles.subTitle}>קובץ מערכת לפי מורים (.xlsx)</h3>
                                    <input
                                        type="file"
                                        id="teacher-excel-input"
                                        accept=".xlsx, .xls"
                                        onChange={(e) => handleFileChange(e, setTeacherFile)}
                                        disabled={isLoading}
                                        className={styles.fileInput}
                                    />
                                    {teacherFile && <span className={styles.fileSuccess}>נבחר: {teacherFile.name}</span>}
                                </div>
                            </div>
                        )}

                        {/* Word (.docx) inputs */}
                        {fileMode === 'word' && (
                            <div className={styles.uploadContainer}>
                                <div>
                                    <h3 className={styles.subTitle}>קובץ מערכת לפי כיתות (.docx)</h3>
                                    <input
                                        type="file"
                                        id="class-word-input"
                                        accept=".docx"
                                        onChange={(e) => handleFileChange(e, setClassWordFile)}
                                        disabled={isLoading}
                                        className={styles.fileInput}
                                    />
                                    {classWordFile && <span className={styles.fileSuccess}>נבחר: {classWordFile.name}</span>}

                                    <br /><br />
                                    <h3 className={styles.subTitle}>קובץ מערכת לפי מורים (.docx)</h3>
                                    <input
                                        type="file"
                                        id="teacher-word-input"
                                        accept=".docx"
                                        onChange={(e) => handleFileChange(e, setTeacherWordFile)}
                                        disabled={isLoading}
                                        className={styles.fileInput}
                                    />
                                    {teacherWordFile && <span className={styles.fileSuccess}>נבחר: {teacherWordFile.name}</span>}
                                </div>
                            </div>
                        )}

                        <div className={styles.actions}>
                            <SubmitBtn
                                type="button"
                                onClick={getEntityValuesFromDB}
                                buttonText="המשך"
                                className={styles.btnPrimary}
                                isLoading={isLoading}
                                disabled={
                                    fileMode === 'excel'
                                        ? (!teacherFile || !classFile)
                                        : (!teacherWordFile || !classWordFile)
                                }
                            />
                        </div>
                    </div>
                )}

                {/* Step 2: Teachers */}
                {step === 2 && (
                    <div className={styles.stepContainer}>
                        <EditableList
                            title="רשימת מורים (שלב 2/6)"
                            items={analyzedData.teachers || []}
                            onSave={(items) => setAnalyzedData(prev => ({ ...prev, teachers: items }))}
                            allowSwap={true}
                            onSwapName={handleEntityMerge}
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
                        />
                        <StepNavigation
                            onNext={handleNext}
                            onPrev={handlePrev}
                            onSaveToDB={(analyzedData.teachers || []).some(t => t.source !== 'both') ? () => handleSaveToDB('teachers') : undefined}
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
                        />
                        <StepNavigation
                            onNext={handleNext}
                            onPrev={handlePrev}
                            onSaveToDB={(analyzedData.classes || []).some(c => c.source !== 'both') ? () => handleSaveToDB('classes') : undefined}
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
                            onMerge={handleEntityMerge}
                            allowMerge={true}
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
                        />
                        <StepNavigation
                            onNext={handleNext}
                            onPrev={handlePrev}
                            onSaveToDB={(analyzedData.subjects || []).some(s => s.source !== 'both') ? () => handleSaveToDB('subjects') : undefined}
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
                            onMerge={handleEntityMerge}
                            allowMerge={true}
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
                        />
                        <StepNavigation
                            onNext={handleNext}
                            onPrev={handlePrev}
                            onSaveToDB={(analyzedData.workGroups || []).some(w => w.source !== 'both') ? () => handleSaveToDB('workGroups') : undefined}
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
                                                                        // Mark as invalid (Red) only if subject or class is missing
                                                                        if (!cell.subject || cell.subject === "ללא מקצוע" || cell.subject.includes("Unknown")) return false;
                                                                        if (!cell.class || cell.class === "ללא כיתה" || cell.class.includes("Unknown")) return false;
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
                                                                                    {/* Display original Excel text in parentheses when no subject is identified */}
                                                                                    {/* {cell.subject === "ללא מקצוע" && cell.originalText && (
                                                                                        <span className={styles.originalTextHint}>
                                                                                            ({cell.originalText})
                                                                                        </span>
                                                                                    )} */}
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
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    {selectedTeacherId && (
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                setIsSaving(true);
                                                try {
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
                                                    if (res.success) {
                                                        mainContext?.setAnnualScheduleTable(undefined);
                                                    }

                                                    const hasSchedule = await checkTeacherHasScheduleAction(selectedTeacherId, schoolId || '');
                                                    setTeacherHasExistingSchedule(hasSchedule);
                                                } catch (err) {
                                                    console.error("Error saving teacher schedule:", err);
                                                    popupMsg("שגיאה בשמירת מערכת המורה");
                                                } finally {
                                                    setIsSaving(false);
                                                }
                                            }}
                                            disabled={isSaving}
                                            className={styles.btnRefresh}
                                            title={teacherHasExistingSchedule ? 'עדכון המערכת' : 'הוספת המערכת'}
                                        >
                                            {isSaving ? "⏳" : (
                                                <Icons.save size={24} />
                                            )}
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            setIsSavingAll(true);
                                            try {
                                                const bulkSchedules = analyzedData.teachers.map(teacher => {
                                                    const teacherScheduleItems = analyzedData.schedule
                                                        .filter(s => s.teacher === teacher.name)
                                                        .map(s => ({
                                                            day: s.day,
                                                            hour: s.hour,
                                                            className: s.class,
                                                            subjectName: s.subject
                                                        }));
                                                    return {
                                                        teacherName: teacher.name,
                                                        scheduleItems: teacherScheduleItems
                                                    };
                                                });

                                                const res = await saveAllTeachersSchedulesAction(
                                                    schoolId || '',
                                                    bulkSchedules
                                                );
                                                popupMsg(res.message);
                                                if (res.success) {
                                                    mainContext?.setAnnualScheduleTable(undefined);
                                                }
                                            } catch (err) {
                                                console.error("Error saving all schedules:", err);
                                                popupMsg("שגיאה בשמירת כל המערכות");
                                            } finally {
                                                setIsSavingAll(false);
                                            }
                                        }}
                                        className={styles.btnPrimary}
                                        disabled={isSavingAll}
                                    >
                                        {isSavingAll ? "עדכון כל המערכות..." : "עדכן את כל המערכות"}
                                    </button>
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
