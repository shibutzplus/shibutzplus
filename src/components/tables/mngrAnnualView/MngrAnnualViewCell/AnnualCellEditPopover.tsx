"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import styles from "./AnnualCellEditPopover.module.css";
import Icons from "@/style/icons";
import CloseButton from "@/components/ui/buttons/CloseButton/CloseButton";
import { usePopoverPosition } from "@/hooks/usePopoverPosition";
import DynamicInputSelect from "@/components/ui/select/InputSelect/DynamicInputSelect";
import { TeacherType, TeacherRoleValues } from "@/models/types/teachers";
import { ClassType } from "@/models/types/classes";
import { SubjectType } from "@/models/types/subjects";
import { sortByName, compareHebrew } from "@/utils/sort";
import { useMainContext } from "@/context/MainContext";
import { buildTeacherTutoringSlotClassesMap } from "@/utils/tutoringSchedule";
import { SelectOption } from "@/models/types";
import { successToast } from "@/lib/toast";

import { AnnualScheduleCell } from "@/models/types/annualSchedule";

export interface PopoverAssignmentRow {
    id: string;
    teacherId: string;
    classId: string;
    subjectId: string;
}

interface AnnualCellEditPopoverProps {
    onClose: () => void;
    anchorRect: DOMRect | null;
    day: string;
    hour: number;
    selectedClassId: string;
    selectedTeacherId: string;
    teachers: TeacherType[];
    classes: ClassType[];
    subjects: SubjectType[];
    cellData?: AnnualScheduleCell;
    onSave?: (assignments: PopoverAssignmentRow[]) => void;
}

const AnnualCellEditPopover: React.FC<AnnualCellEditPopoverProps> = ({
    onClose,
    anchorRect,
    day,
    hour,
    selectedClassId,
    selectedTeacherId,
    teachers,
    classes,
    subjects,
    cellData,
    onSave,
}) => {
    const [mounted, setMounted] = useState(false);

    const isClassView = Boolean(selectedClassId);
    const isTeacherView = !selectedClassId && Boolean(selectedTeacherId);

    // Helper: checks if class is an activity group, with "פרטני" as an explicit exception
    const isActivityGroup = (cls?: ClassType) => {
        if (!cls || !cls.activity) return false;
        const name = cls.name?.trim() || "";
        return !name.includes("פרטני");
    };

    // Helper: find tutoring class & subject
    const tutoringClassObj = useMemo(
        () => classes?.find((c) => c.name?.trim() === "פרטני" || c.name?.includes("פרטני")),
        [classes]
    );
    const tutoringSubjectObj = useMemo(
        () => subjects?.find((s) => s.name?.trim() === "פרטני" || s.name?.includes("פרטני")),
        [subjects]
    );

    const isTutoringClassId = (classId?: string) => {
        if (!classId) return false;
        const cls = classes?.find((c) => c.id === classId);
        return Boolean(cls?.name?.trim() === "פרטני" || cls?.name?.includes("פרטני"));
    };

    const isTutoringSubjectId = (subjectId?: string) => {
        if (!subjectId) return false;
        const sub = subjects?.find((s) => s.id === subjectId);
        return Boolean(sub?.name?.trim() === "פרטני" || sub?.name?.includes("פרטני"));
    };

    const getActivitySubId = (classId?: string) => {
        if (!classId) return undefined;
        const cls = classes?.find((c) => c.id === classId);
        if (!isActivityGroup(cls)) return undefined;

        // 1. Exact name match
        const exact = subjects?.find((s) => s.name === cls?.name);
        if (exact) return exact.id;

        // 2. Normalized match (ignoring whitespace, quotes and apostrophes)
        const norm = (str?: string) => (str || "").replace(/['"״׳`\s]/g, "").trim().toLowerCase();
        const clsNorm = norm(cls?.name);
        const normMatch = subjects?.find((s) => norm(s.name) === clsNorm);
        if (normMatch) return normMatch.id;

        // 3. Subject marked with activity: true and normalized name matches
        const actMatch = subjects?.find((s) => s.activity && norm(s.name) === clsNorm);
        if (actMatch) return actMatch.id;

        // 4. Any subject with activity: true whose name is contained or contains cls name
        const partial = subjects?.find(
            (s) => s.activity && (norm(s.name).includes(clsNorm) || clsNorm.includes(norm(s.name)))
        );
        if (partial) return partial.id;

        return undefined;
    };

    // Initialize assignment rows from cellData
    const initialRows = useMemo((): PopoverAssignmentRow[] => {
        const rows: PopoverAssignmentRow[] = [];

        if (isClassView) {
            const clsId = selectedClassId;
            const targetCls = classes?.find((c) => c.id === clsId);
            const isAct = isActivityGroup(targetCls);
            const autoSubId = getActivitySubId(clsId) || cellData?.subjects?.[0] || "";

            if (cellData?.teacherSubjects && cellData.teacherSubjects.length > 0) {
                cellData.teacherSubjects.forEach((ts, idx) => {
                    rows.push({
                        id: `row-${idx}-${ts.teacherId}-${ts.subjectId}`,
                        teacherId: ts.teacherId || "",
                        classId: clsId,
                        subjectId: isAct ? (autoSubId || ts.subjectId || "") : (ts.subjectId || autoSubId || ""),
                    });
                });
            } else if (cellData?.teachers && cellData.teachers.length > 0) {
                cellData.teachers.forEach((tId, idx) => {
                    const sId = isAct
                        ? (autoSubId || cellData.subjects?.[idx] || cellData.subjects?.[0] || "")
                        : (cellData.subjects?.[idx] || cellData.subjects?.[0] || autoSubId || "");
                    rows.push({
                        id: `row-${idx}-${tId}-${sId}`,
                        teacherId: tId,
                        classId: clsId,
                        subjectId: sId,
                    });
                });
            } else if (cellData?.subjects && cellData.subjects.length > 0) {
                cellData.subjects.forEach((sId, idx) => {
                    rows.push({
                        id: `row-${idx}-notchr-${sId}`,
                        teacherId: "",
                        classId: clsId,
                        subjectId: isAct ? (autoSubId || sId) : (sId || autoSubId || ""),
                    });
                });
            }
        } else if (isTeacherView) {
            const tId = selectedTeacherId;
            const tutoringClsId = tutoringClassObj?.id || "";

            // Helper to resolve the matching tutoring class (e.g. "פרטני - שפה") from the subject ID
            const resolveTutoringClsId = (subId?: string) => {
                if (!subId) return tutoringClsId;
                const subObj = subjects?.find((s) => s.id === subId);
                if (!subObj?.name) return tutoringClsId;
                const subName = subObj.name.trim();
                const matchingCls = classes?.find((c) => c.name?.trim() === subName);
                return matchingCls?.id || tutoringClsId;
            };

            if (cellData?.classSubjects && cellData.classSubjects.length > 0) {
                cellData.classSubjects.forEach((cs, idx) => {
                    const isTutoringSub = isTutoringSubjectId(cs.subjectId);
                    const isTutoringCls = isTutoringClassId(cs.classId);

                    if (isTutoringSub && !isTutoringCls && tutoringClsId) {
                        // Stored as specific class + tutoring subject -> Map to: First dropdown = specific tutoring group, Second = specific class
                        const effectiveTutoringClsId = resolveTutoringClsId(cs.subjectId);
                        rows.push({
                            id: `row-${idx}-tutoring-${cs.classId}`,
                            teacherId: tId,
                            classId: effectiveTutoringClsId,
                            subjectId: cs.classId, // In tutoring mode, subjectId stores the participating class
                        });
                    } else if (isTutoringCls) {
                        rows.push({
                            id: `row-${idx}-tutoring-gen`,
                            teacherId: tId,
                            classId: cs.classId,
                            subjectId: "",
                        });
                    } else {
                        const autoSubId = getActivitySubId(cs.classId);
                        rows.push({
                            id: `row-${idx}-${cs.classId}-${cs.subjectId}`,
                            teacherId: tId,
                            classId: cs.classId || "",
                            subjectId: cs.subjectId || autoSubId || "",
                        });
                    }
                });
            } else if (cellData?.teacherSubjects && cellData.teacherSubjects.length > 0) {
                const relevant = cellData.teacherSubjects.filter((ts) => ts.teacherId === tId);
                const classesList = cellData.classes || [];
                relevant.forEach((ts, idx) => {
                    const classId = classesList[idx] || classesList[0] || "";
                    const isTutoringSub = isTutoringSubjectId(ts.subjectId);
                    const isTutoringCls = isTutoringClassId(classId);

                    if (isTutoringSub && !isTutoringCls && tutoringClsId) {
                        const effectiveTutoringClsId = resolveTutoringClsId(ts.subjectId);
                        rows.push({
                            id: `row-${idx}-tutoring-${classId}`,
                            teacherId: tId,
                            classId: effectiveTutoringClsId,
                            subjectId: classId,
                        });
                    } else if (isTutoringCls) {
                        rows.push({
                            id: `row-${idx}-tutoring-gen`,
                            teacherId: tId,
                            classId,
                            subjectId: "",
                        });
                    } else {
                        const autoSubId = getActivitySubId(classId);
                        rows.push({
                            id: `row-${idx}-${ts.teacherId}-${ts.subjectId}`,
                            teacherId: tId,
                            classId,
                            subjectId: ts.subjectId || autoSubId || "",
                        });
                    }
                });
            } else if (cellData?.classes && cellData.classes.length > 0) {
                cellData.classes.forEach((cId, idx) => {
                    const sId = cellData.subjects?.[idx] || cellData.subjects?.[0] || "";
                    const isTutoringSub = isTutoringSubjectId(sId);
                    const isTutoringCls = isTutoringClassId(cId);

                    if (isTutoringSub && !isTutoringCls && tutoringClsId) {
                        const effectiveTutoringClsId = resolveTutoringClsId(sId);
                        rows.push({
                            id: `row-${idx}-tutoring-${cId}`,
                            teacherId: tId,
                            classId: effectiveTutoringClsId,
                            subjectId: cId,
                        });
                    } else if (isTutoringCls) {
                        rows.push({
                            id: `row-${idx}-tutoring-gen`,
                            teacherId: tId,
                            classId: cId,
                            subjectId: "",
                        });
                    } else {
                        const autoSubId = getActivitySubId(cId);
                        rows.push({
                            id: `row-${idx}-${cId}-${sId}`,
                            teacherId: tId,
                            classId: cId,
                            subjectId: sId || autoSubId || "",
                        });
                    }
                });
            }
        }

        // Default to single blank row if empty
        if (rows.length === 0) {
            const clsId = isClassView ? selectedClassId : "";
            const autoSubId = isClassView ? getActivitySubId(clsId) || cellData?.subjects?.[0] || "" : "";
            rows.push({
                id: `row-new-${Date.now()}`,
                teacherId: isTeacherView ? selectedTeacherId : "",
                classId: clsId,
                subjectId: autoSubId,
            });
        }

        return rows;
    }, [
        cellData,
        classes,
        isClassView,
        isTeacherView,
        selectedClassId,
        selectedTeacherId,
        subjects,
        tutoringClassObj,
        tutoringSubjectObj,
    ]);

    const [assignments, setAssignments] = useState<PopoverAssignmentRow[]>(initialRows);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [focusedRowId, setFocusedRowId] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    // Teacher options: regular teachers sorted by Hebrew name
    const teacherOptions = useMemo(() => {
        return (teachers || [])
            .filter((t) => t.role === TeacherRoleValues.REGULAR)
            .sort(sortByName)
            .map((t) => ({
                value: t.id,
                label: t.name,
            }));
    }, [teachers]);

    // Class options: organic classes first, then workgroups (activity: true)
    const classOptions = useMemo(() => {
        return [...(classes || [])]
            .sort((a, b) => {
                if (a.activity !== b.activity) return a.activity ? 1 : -1;
                return compareHebrew(a.name, b.name);
            })
            .map((c) => ({
                value: c.id,
                label: c.name,
            }));
    }, [classes]);

    const tutoringOnlyOptions = useMemo(() => {
        return classOptions.filter((o) => isTutoringClassId(o.value));
    }, [classOptions]);

    const getRowClassOptions = (classId?: string) => {
        if (isTutoringClassId(classId)) {
            if (tutoringOnlyOptions.length > 0) return tutoringOnlyOptions;
            const cls = classes?.find((c) => c.id === classId);
            return cls ? [{ value: cls.id, label: cls.name }] : classOptions;
        }
        return classOptions;
    };

    const { annualScheduleTable, school, addNewSubject } = useMainContext();

    const tutoringSlotClassesMap = useMemo(() => {
        if (!selectedTeacherId) return null;
        return buildTeacherTutoringSlotClassesMap(
            selectedTeacherId,
            annualScheduleTable,
            undefined,
            classes,
            subjects
        );
    }, [selectedTeacherId, annualScheduleTable, classes, subjects]);

    // Options for participating classes in tutoring:
    // Shows all organic classes in the school, sorted primarily by active subject in chip, then by class name.
    const getTutoringParticipatingClassOptions = (rowTeacherId?: string, selectedClassId?: string) => {
        const teacherId = isTeacherView ? selectedTeacherId : rowTeacherId;
        const slotMap =
            teacherId === selectedTeacherId
                ? tutoringSlotClassesMap
                : teacherId
                    ? buildTeacherTutoringSlotClassesMap(teacherId, annualScheduleTable, undefined, classes, subjects)
                    : null;

        const matchedClasses = slotMap?.[day]?.[hour] || [];
        const options: SelectOption[] = [];
        const addedIds = new Set<string>();

        // 1. Add all matched classes from slotMap (already includes all organic classes, sorted by subject!)
        matchedClasses.forEach(({ classObj, subjectName }) => {
            if (!addedIds.has(classObj.id)) {
                options.push({
                    value: classObj.id,
                    label: classObj.name,
                    subLabel: subjectName,
                });
                addedIds.add(classObj.id);
            }
        });

        // 2. Ensure currently selected class is present so its label renders even if custom
        if (selectedClassId && !addedIds.has(selectedClassId)) {
            const currentCls = classes?.find((c) => c.id === selectedClassId);
            if (currentCls) {
                options.push({
                    value: currentCls.id,
                    label: currentCls.name,
                });
                addedIds.add(currentCls.id);
            }
        }

        // 3. Fallback: all remaining organic homeroom classes if slotMap was empty
        (classes || [])
            .filter((c) => !c.activity && !c.name?.trim().includes("פרטני"))
            .sort((a, b) => compareHebrew(a.name, b.name))
            .forEach((c) => {
                if (!addedIds.has(c.id)) {
                    options.push({
                        value: c.id,
                        label: c.name,
                    });
                    addedIds.add(c.id);
                }
            });

        return options;
    };

    // Subject options getter: includes matching activity subject if an activity class/group is selected,
    // and always includes tutoring subjects (like "פרטני - שפה") and the currently selected subject.
    const getSubjectOptions = (classId?: string, currentSubjectId?: string) => {
        const targetClassId = isClassView ? selectedClassId : classId;
        const selectedCls = classes?.find((c) => c.id === targetClassId);

        if (isActivityGroup(selectedCls)) {
            const matchingSubject = subjects?.find((s) => s.name === selectedCls?.name);
            const list = matchingSubject ? [matchingSubject] : [];
            const regular = (subjects || []).filter((s) => !s.activity);
            return [...list, ...regular]
                .sort(sortByName)
                .map((s) => ({ value: s.id, label: s.name }));
        }

        return (subjects || [])
            .filter((s) => !s.activity || s.name?.includes("פרטני") || s.id === currentSubjectId)
            .sort(sortByName)
            .map((s) => ({ value: s.id, label: s.name }));
    };

    const handleUpdateRow = (
        id: string,
        field: "teacherId" | "classId" | "subjectId",
        value: string
    ) => {
        if (errorMessage) setErrorMessage(null);

        // Warning if another teacher is already scheduled for tutoring with this class
        if (field === "subjectId" && isTeacherView && value) {
            const currentRow = assignments.find((r) => r.id === id);
            if (currentRow && isTutoringClassId(currentRow.classId)) {
                const tutoringName = classes?.find((c) => c.id === currentRow.classId)?.name?.trim();
                const dup = annualScheduleTable?.find(
                    (e) =>
                        e.classId === value &&
                        e.teacherId !== selectedTeacherId &&
                        subjects?.find((s) => s.id === e.subjectId)?.name?.trim() === tutoringName
                );
                if (dup) {
                    const teacherName = teachers?.find((t) => t.id === dup.teacherId)?.name;
                    const className = classes?.find((c) => c.id === value)?.name;
                    successToast(`שימו לב: כיתה ${className} כבר משובצת לשיעור ${tutoringName} עם ${teacherName}`);
                }
            }
        }

        setAssignments((prev) =>
            prev.map((row) => {
                if (row.id !== id) return row;
                const updated = { ...row, [field]: value };

                // If class changed and it's an activity class (not פרטני), auto-assign matching subject
                if (field === "classId") {
                    const selectedCls = classes?.find((c) => c.id === value);
                    const isTutoring = isTutoringClassId(value);

                    if (isTutoring) {
                        // In tutoring mode, subjectId stores the optional participating class; reset if switching to tutoring
                        const prevIsTutoring = isTutoringClassId(row.classId);
                        if (!prevIsTutoring) {
                            updated.subjectId = "";
                        }
                    } else if (isActivityGroup(selectedCls)) {
                        const matchingSubjectId = getActivitySubId(value);
                        if (matchingSubjectId) {
                            updated.subjectId = matchingSubjectId;
                        }
                    } else {
                        const prevCls = classes?.find((c) => c.id === row.classId);
                        if (isActivityGroup(prevCls) || isTutoringClassId(row.classId)) {
                            updated.subjectId = "";
                        }
                    }
                }
                return updated;
            })
        );
    };

    const handleAddRow = () => {
        if (errorMessage) setErrorMessage(null);
        const clsId = isClassView ? selectedClassId : "";
        const targetCls = isClassView ? classes?.find((c) => c.id === clsId) : undefined;
        const isAct = isActivityGroup(targetCls);
        const autoSubId = isAct ? getActivitySubId(clsId) || "" : "";
        const newRowId = `row-new-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        setAssignments((prev) => [
            ...prev,
            {
                id: newRowId,
                teacherId: isTeacherView ? selectedTeacherId : "",
                classId: clsId,
                subjectId: autoSubId,
            },
        ]);
        setFocusedRowId(newRowId);
    };

    const handleRemoveRow = (id: string) => {
        if (errorMessage) setErrorMessage(null);
        setAssignments((prev) => {
            const next = prev.filter((row) => row.id !== id);
            // If user removes the only remaining row, keep an empty placeholder row
            if (next.length === 0) {
                const clsId = isClassView ? selectedClassId : "";
                const targetCls = classes?.find((c) => c.id === clsId);
                const isAct = isActivityGroup(targetCls);
                const autoSubId = isAct ? getActivitySubId(clsId) || "" : "";
                return [
                    {
                        id: `row-empty-${Date.now()}`,
                        teacherId: isTeacherView ? selectedTeacherId : "",
                        classId: clsId,
                        subjectId: autoSubId,
                    },
                ];
            }
            return next;
        });
    };

    // Desktop positioning logic relative to anchorRect (the <td> cell)
    const neededHeight = 130 + assignments.length * 75;
    const desktopStyle = usePopoverPosition(anchorRect, {
        width: 340,
        align: "center",
        neededHeight,
        deps: [assignments.length],
    });

    const canAddRow = useMemo(() => {
        return assignments.every((row) => {
            if (isClassView) {
                const targetCls = classes?.find((c) => c.id === selectedClassId);
                const isAct = isActivityGroup(targetCls);
                if (isAct) return Boolean(row.teacherId);
                return Boolean(row.teacherId && row.subjectId);
            }
            if (isTeacherView) {
                const isTutoring = isTutoringClassId(row.classId);
                if (isTutoring) return Boolean(row.classId); // Tutoring row needs only tutoring class (participating class is optional)
                const targetCls = classes?.find((c) => c.id === row.classId);
                const isAct = isActivityGroup(targetCls);
                if (isAct) return Boolean(row.classId);
                return Boolean(row.classId && row.subjectId);
            }
            return Boolean(row.teacherId && row.subjectId);
        });
    }, [assignments, classes, isClassView, isTeacherView, selectedClassId]);

    if (!mounted) return null;

    const mainEntityName = isClassView
        ? classes?.find((c) => c.id === selectedClassId)?.name
        : teachers?.find((t) => t.id === selectedTeacherId)?.name;

    const handleConfirm = async () => {
        // Validate each row for incomplete assignments
        for (const row of assignments) {
            if (isClassView) {
                const targetCls = classes?.find((c) => c.id === selectedClassId);
                const isAct = isActivityGroup(targetCls);

                const hasTeacher = Boolean(row.teacherId);
                const hasSubject = Boolean(row.subjectId);

                // Completely blank row is allowed (will be filtered out or clear cell)
                if (!hasTeacher && !hasSubject) continue;

                if (!hasTeacher) {
                    setErrorMessage("יש לבחור גם מורה");
                    return;
                }
                if (!isAct && !hasSubject) {
                    setErrorMessage("יש לבחור גם מקצוע");
                    return;
                }
            } else if (isTeacherView) {
                const isTutoring = isTutoringClassId(row.classId);
                const targetCls = classes?.find((c) => c.id === row.classId);
                const isAct = isActivityGroup(targetCls);

                const hasClass = Boolean(row.classId);
                const hasSubject = Boolean(row.subjectId);

                // Completely blank row is allowed
                if (!hasClass && !hasSubject) continue;

                if (!hasClass) {
                    setErrorMessage("יש לבחור גם כיתה");
                    return;
                }
                // In tutoring, participating class (subjectId) is optional
                if (!isTutoring && !isAct && !hasSubject) {
                    setErrorMessage("יש לבחור גם מקצוע");
                    return;
                }
            }
        }

        // Filter out completely blank rows
        const validRows = assignments.filter((row) => {
            if (isClassView) {
                const targetCls = classes?.find((c) => c.id === selectedClassId);
                const isAct = isActivityGroup(targetCls);
                return isAct ? Boolean(row.teacherId) : Boolean(row.teacherId && row.subjectId);
            }
            if (isTeacherView) {
                const isTutoring = isTutoringClassId(row.classId);
                if (isTutoring) return Boolean(row.classId);
                const targetCls = classes?.find((c) => c.id === row.classId);
                const isAct = isActivityGroup(targetCls);
                return isAct ? Boolean(row.classId) : Boolean(row.classId && row.subjectId);
            }
            return Boolean(row.teacherId && row.subjectId);
        });

        // Ensure every row is properly mapped before saving:
        // - Tutoring rows: if participating class is chosen -> (class: participatingClass, subject: specific tutoring subject e.g. "פרטני - שפה")
        //                 if no participating class -> (class: tutoringClass, subject: specific tutoring subject)
        // - Activity group rows: auto-attach matching activity subject
        const tutoringSubId = tutoringSubjectObj?.id || "";
        const tutoringClsId = tutoringClassObj?.id || "";

        // Helper to resolve specific subject matching the tutoring class (e.g. "פרטני - שפה")
        const getTutoringMatchingSubId = async (tutoringClassId?: string): Promise<string> => {
            if (!tutoringClassId) return tutoringSubId;
            const cls = classes?.find((c) => c.id === tutoringClassId);
            if (!cls) return tutoringSubId;

            const trimmedName = cls.name?.trim();
            // 1. Exact name match in subjects
            const exact = subjects?.find((s) => s.name?.trim() === trimmedName);
            if (exact) return exact.id;

            // 2. Normalized match (ignoring whitespace, quotes and apostrophes)
            const norm = (str?: string) => (str || "").replace(/['"״׳`\s]/g, "").trim().toLowerCase();
            const clsNorm = norm(trimmedName);
            const normMatch = subjects?.find((s) => norm(s.name) === clsNorm);
            if (normMatch) return normMatch.id;

            // 3. Auto-create matching subject if it doesn't exist yet so DB Foreign Key is satisfied
            if (trimmedName && school?.id && addNewSubject) {
                try {
                    const created = await addNewSubject({
                        name: trimmedName,
                        schoolId: school.id,
                        activity: true,
                    });
                    if (created?.id) return created.id;
                } catch (e) {
                    console.error("Failed to auto-create tutoring subject", e);
                }
            }

            return tutoringSubId;
        };

        const processedRows: PopoverAssignmentRow[] = [];
        for (const row of validRows) {
            if (isTeacherView && isTutoringClassId(row.classId)) {
                const specificSubId = await getTutoringMatchingSubId(row.classId);
                const participatingClassId = row.subjectId; // In tutoring row, subjectId held the participating class id
                if (participatingClassId) {
                    processedRows.push({
                        ...row,
                        classId: participatingClassId,
                        subjectId: specificSubId,
                    });
                } else {
                    processedRows.push({
                        ...row,
                        classId: row.classId || tutoringClsId,
                        subjectId: specificSubId,
                    });
                }
            } else {
                const effectiveClsId = isClassView ? selectedClassId : row.classId;
                const targetCls = classes?.find((c) => c.id === effectiveClsId);
                if (isActivityGroup(targetCls) && !row.subjectId) {
                    const autoSubId = getActivitySubId(effectiveClsId) || "";
                    processedRows.push({ ...row, subjectId: autoSubId });
                } else {
                    processedRows.push(row);
                }
            }
        }

        // Deduplicate rows with the exact same (teacherId, classId, subjectId)
        const seenKeys = new Set<string>();
        const uniqueRows = processedRows.filter((row) => {
            const key = `${row.teacherId}|${row.classId}|${row.subjectId}`;
            if (seenKeys.has(key)) return false;
            seenKeys.add(key);
            return true;
        });

        setErrorMessage(null);
        onSave?.(uniqueRows);
        onClose();
    };

    return createPortal(
        <>
            {/* Backdrop */}
            <div className={styles.backdrop} onClick={onClose} />

            {/* Popover Window */}
            <div
                className={styles.popover}
                style={desktopStyle}
                role="dialog"
                aria-modal="true"
                aria-label="עריכת שיבוץ"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Title Bar */}
                <div className={styles.titleBar}>
                    <div className={styles.titleContent}>
                        <span className={styles.titleDetails}>
                            <span>{`יום ${day}', שעה ${hour}`}</span>
                            {mainEntityName && <span>:</span>}
                            {mainEntityName && (
                                <span className={styles.titleClass}>
                                    {isClassView
                                        ? (mainEntityName.startsWith("כיתה") ? mainEntityName : `כיתה ${mainEntityName}`)
                                        : mainEntityName}
                                </span>
                            )}
                        </span>
                    </div>

                    <CloseButton
                        onClose={onClose}
                        className={styles.titleCloseButton}
                    />
                </div>

                {/* Body: Assignment Rows */}
                <div className={styles.body}>
                    <div className={styles.assignmentsList}>
                        {assignments.map((row, index) => {
                            const targetClassId = isClassView ? selectedClassId : row.classId;
                            const targetCls = classes?.find((c) => c.id === targetClassId);
                            const isActGroup = isActivityGroup(targetCls);

                            const hasRowValues = isClassView
                                ? Boolean(row.teacherId || (!isActGroup && row.subjectId))
                                : Boolean(row.classId || row.subjectId);
                            const isDeleteDisabled = assignments.length === 1 && !hasRowValues;
                            const isRowFocused = focusedRowId ? row.id === focusedRowId : index === 0;

                            return (
                                <div key={row.id} className={styles.assignmentRow}>
                                    <div className={styles.assignmentInputs}>
                                        {isClassView ? (
                                            <>
                                                <DynamicInputSelect
                                                    options={teacherOptions}
                                                    value={row.teacherId}
                                                    onChange={(val) => handleUpdateRow(row.id, "teacherId", val)}
                                                    placeholder="מורה..."
                                                    isSearchable
                                                    isClearable
                                                    hasBorder
                                                    isBold
                                                    autoFocus={isRowFocused}
                                                    menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                                                />
                                                {!isActGroup && (
                                                    <DynamicInputSelect
                                                        options={getSubjectOptions(row.classId, row.subjectId)}
                                                        value={row.subjectId}
                                                        onChange={(val) => handleUpdateRow(row.id, "subjectId", val)}
                                                        placeholder="מקצוע..."
                                                        isSearchable
                                                        isClearable
                                                        hasBorder
                                                        menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                                                    />
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                <DynamicInputSelect
                                                    options={getRowClassOptions(row.classId)}
                                                    value={row.classId}
                                                    onChange={(val) => handleUpdateRow(row.id, "classId", val)}
                                                    placeholder="כיתה או קבוצה..."
                                                    isSearchable
                                                    isClearable
                                                    hasBorder
                                                    isBold
                                                    autoFocus={isRowFocused}
                                                    menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                                                />
                                                {isTutoringClassId(row.classId) ? (
                                                    <DynamicInputSelect
                                                        options={getTutoringParticipatingClassOptions(row.teacherId, row.subjectId)}
                                                        value={row.subjectId}
                                                        onChange={(val) => handleUpdateRow(row.id, "subjectId", val)}
                                                        placeholder="כיתה (אופציונלי)..."
                                                        isSearchable
                                                        isClearable
                                                        hasBorder
                                                        menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                                                    />
                                                ) : (
                                                    !isActGroup && (
                                                        <DynamicInputSelect
                                                            options={getSubjectOptions(row.classId, row.subjectId)}
                                                            value={row.subjectId}
                                                            onChange={(val) => handleUpdateRow(row.id, "subjectId", val)}
                                                            placeholder="מקצוע..."
                                                            isSearchable
                                                            isClearable
                                                            hasBorder
                                                            menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                                                        />
                                                    )
                                                )}
                                            </>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        className={styles.removeBtn}
                                        onClick={() => handleRemoveRow(row.id)}
                                        disabled={isDeleteDisabled}
                                        title={
                                            isDeleteDisabled
                                                ? undefined
                                                : assignments.length > 1
                                                    ? "הסר שיבוץ זה"
                                                    : "נקה שיבוץ"
                                        }
                                        aria-label={assignments.length > 1 ? "הסר שיבוץ זה" : "נקה שיבוץ"}
                                    >
                                        <Icons.delete size={18} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {/* Add Assignment Button */}
                    <button
                        type="button"
                        className={styles.addRowBtn}
                        onClick={handleAddRow}
                        disabled={!canAddRow}
                        title={
                            !canAddRow
                                ? isClassView
                                    ? "יש לבחור מורה ומקצוע לפני הוספת שיבוץ נוסף"
                                    : "יש לבחור כיתה ומקצוע לפני הוספת שיבוץ נוסף"
                                : undefined
                        }
                    >
                        <Icons.plus size={13} />
                        <span>{isClassView ? "מורה נוסף" : "כיתה נוספת"}</span>
                    </button>
                </div>

                {/* Footer Actions */}
                <div className={styles.footer}>
                    <div className={styles.errorContainer}>
                        {errorMessage && (
                            <span className={styles.errorText}>
                                {errorMessage}
                            </span>
                        )}
                    </div>
                    <button
                        type="button"
                        className={styles.doneBtn}
                        onClick={handleConfirm}
                    >
                        אישור
                    </button>
                </div>
            </div>
        </>,
        document.body,
    );
};

export default AnnualCellEditPopover;
