"use client";

import React, { useState, useRef, useMemo } from "react";
import styles from "./AnnualScheduleInfoPopup.module.css";
import DynamicInputSelect from "@/components/ui/select/InputSelect/DynamicInputSelect";
import Icons from "@/style/icons";
import { AnnualScheduleType } from "@/models/types/annualSchedule";
import { ClassType } from "@/models/types/classes";
import { SubjectType } from "@/models/types/subjects";
import { TeacherType } from "@/models/types/teachers";
import { calculateTeacherScheduleStats, calculateClassScheduleStats, } from "@/utils/scheduleStatistics";

interface AnnualScheduleInfoPopupProps {
    mode?: "teacher" | "class";
    teachers?: TeacherType[];
    classes?: ClassType[];
    subjects?: SubjectType[];
    annualScheduleTable?: AnnualScheduleType[];
    initialTeacherId?: string | null;
    initialClassId?: string | null;
    onTeacherChange?: (teacherId: string) => void;
    onClassChange?: (classId: string) => void;
}

const AnnualScheduleInfoPopup: React.FC<AnnualScheduleInfoPopupProps> = ({
    mode,
    teachers = [],
    classes = [],
    subjects = [],
    annualScheduleTable = [],
    initialTeacherId = null,
    initialClassId = null,
    onTeacherChange,
    onClassChange,
}) => {
    // Determine whether this popup instance is for a teacher or a class (no tabs)
    const currentMode: "teacher" | "class" =
        mode || (initialTeacherId ? "teacher" : "class");

    // Filter only organic classes (excluding work groups / activity classes)
    const organicClasses = useMemo(() => {
        return (classes || []).filter((c) => !c.activity);
    }, [classes]);

    const initialClass = useMemo(() => {
        return (classes || []).find((c) => c.id === initialClassId);
    }, [classes, initialClassId]);

    const validInitialClassId = initialClass && !initialClass.activity ? initialClassId : null;

    const [currentTeacherId, setCurrentTeacherId] = useState<string | null>(
        initialTeacherId || null
    );
    const [currentClassId, setCurrentClassId] = useState<string | null>(
        validInitialClassId || null
    );

    const scrollableRef = useRef<HTMLDivElement>(null);

    const handleHeaderWheel = (e: React.WheelEvent) => {
        if (scrollableRef.current) {
            scrollableRef.current.scrollTop += e.deltaY;
        }
    };

    // Calculate teacherStats dynamically
    const teacherStats = useMemo(() => {
        if (currentMode !== "teacher") return null;
        if (teachers.length > 0 && currentTeacherId) {
            return calculateTeacherScheduleStats(
                currentTeacherId,
                annualScheduleTable,
                teachers,
                classes,
                subjects
            );
        }
        return null;
    }, [currentMode, teachers, currentTeacherId, annualScheduleTable, classes, subjects]);

    // Calculate classStats dynamically
    const classStats = useMemo(() => {
        if (currentMode !== "class") return null;
        if (organicClasses.length > 0 && currentClassId) {
            return calculateClassScheduleStats(
                currentClassId,
                annualScheduleTable,
                organicClasses,
                teachers,
                subjects
            );
        }
        return null;
    }, [currentMode, organicClasses, currentClassId, annualScheduleTable, teachers, subjects]);

    const teacherOptions = useMemo(() => {
        return (teachers || []).map((t) => ({
            value: t.id,
            label: t.name,
        }));
    }, [teachers]);

    const classOptions = useMemo(() => {
        return organicClasses.map((c) => ({
            value: c.id,
            label: c.name,
        }));
    }, [organicClasses]);

    const handlePrevTeacher = () => {
        if (teacherOptions.length === 0) return;
        const currentIndex = teacherOptions.findIndex((opt) => opt.value === currentTeacherId);
        const prevIndex =
            currentIndex === -1
                ? teacherOptions.length - 1
                : (currentIndex - 1 + teacherOptions.length) % teacherOptions.length;
        const newId = teacherOptions[prevIndex].value;
        setCurrentTeacherId(newId);
        onTeacherChange?.(newId);
    };

    const handleNextTeacher = () => {
        if (teacherOptions.length === 0) return;
        const currentIndex = teacherOptions.findIndex((opt) => opt.value === currentTeacherId);
        const nextIndex =
            currentIndex === -1 ? 0 : (currentIndex + 1) % teacherOptions.length;
        const newId = teacherOptions[nextIndex].value;
        setCurrentTeacherId(newId);
        onTeacherChange?.(newId);
    };

    const handlePrevClass = () => {
        if (classOptions.length === 0) return;
        const currentIndex = classOptions.findIndex((opt) => opt.value === currentClassId);
        const prevIndex =
            currentIndex === -1
                ? classOptions.length - 1
                : (currentIndex - 1 + classOptions.length) % classOptions.length;
        const newId = classOptions[prevIndex].value;
        setCurrentClassId(newId);
        onClassChange?.(newId);
    };

    const handleNextClass = () => {
        if (classOptions.length === 0) return;
        const currentIndex = classOptions.findIndex((opt) => opt.value === currentClassId);
        const nextIndex =
            currentIndex === -1 ? 0 : (currentIndex + 1) % classOptions.length;
        const newId = classOptions[nextIndex].value;
        setCurrentClassId(newId);
        onClassChange?.(newId);
    };

    const handleTeacherSelectChange = (val: string) => {
        const nextVal = val || null;
        setCurrentTeacherId(nextVal);
        onTeacherChange?.(val || "");
    };

    const handleClassSelectChange = (val: string) => {
        const nextVal = val || null;
        setCurrentClassId(nextVal);
        onClassChange?.(val || "");
    };

    return (
        <div className={styles.container}>
            {/* Sticky Header: Dropdown with navigation arrows + KPI Cards */}
            <div className={styles.stickyHeader} onWheel={handleHeaderWheel}>
                <div className={styles.topControlRow}>
                    <div className={styles.selectWithAction}>
                        {currentMode === "teacher" ? (
                            <>
                                <div className={styles.selectWrapper}>
                                    <DynamicInputSelect
                                        options={teacherOptions}
                                        value={currentTeacherId || ""}
                                        onChange={handleTeacherSelectChange}
                                        isSearchable={true}
                                        placeholder="מורה..."
                                        hasBorder
                                        isClearable={false}
                                        isBold={Boolean(currentTeacherId)}
                                        menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                                    />
                                </div>
                                <button
                                    type="button"
                                    className={styles.nextButton}
                                    onClick={handlePrevTeacher}
                                    disabled={teacherOptions.length === 0}
                                    title="מורה קודם"
                                    aria-label="מורה קודם"
                                >
                                    <Icons.caretRight size={24} />
                                </button>
                                <button
                                    type="button"
                                    className={styles.nextButton}
                                    onClick={handleNextTeacher}
                                    disabled={teacherOptions.length === 0}
                                    title="מורה הבא"
                                    aria-label="מורה הבא"
                                >
                                    <Icons.caretLeft size={24} />
                                </button>
                            </>
                        ) : (
                            <>
                                <div className={styles.selectWrapper}>
                                    <DynamicInputSelect
                                        options={classOptions}
                                        value={currentClassId || ""}
                                        onChange={handleClassSelectChange}
                                        isSearchable={true}
                                        placeholder="כיתה..."
                                        hasBorder
                                        isClearable={false}
                                        isBold={Boolean(currentClassId)}
                                        menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                                    />
                                </div>
                                <button
                                    type="button"
                                    className={styles.nextButton}
                                    onClick={handlePrevClass}
                                    disabled={classOptions.length === 0}
                                    title="כיתה קודמת"
                                    aria-label="כיתה קודמת"
                                >
                                    <Icons.caretRight size={24} />
                                </button>
                                <button
                                    type="button"
                                    className={styles.nextButton}
                                    onClick={handleNextClass}
                                    disabled={classOptions.length === 0}
                                    title="כיתה הבאה"
                                    aria-label="כיתה הבאה"
                                >
                                    <Icons.caretLeft size={24} />
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* KPI Cards for Teacher */}
                {currentMode === "teacher" && teacherStats && (
                    <div className={styles.kpiGrid}>
                        <div className={`${styles.kpiCard} ${styles.kpiOrange}`}>
                            <span className={styles.kpiValue}>{teacherStats.totalHours}</span>
                            <span className={styles.kpiLabel}>{"סה\"כ ש\"ש"}</span>
                        </div>
                        <div className={`${styles.kpiCard} ${styles.kpiSky}`}>
                            <span className={styles.kpiValue}>{teacherStats.frontalHours}</span>
                            <span className={styles.kpiLabel}>פרונטלי</span>
                        </div>
                    </div>
                )}

                {/* KPI Cards for Class */}
                {currentMode === "class" && classStats && (
                    <div className={styles.kpiGrid}>
                        <div className={`${styles.kpiCard} ${styles.kpiOrange}`}>
                            <span className={styles.kpiValue}>{classStats.totalHours}</span>
                            <span className={styles.kpiLabel}>{"סה\"כ ש\"ש"}</span>
                        </div>
                        <div className={`${styles.kpiCard} ${styles.kpiSky}`}>
                            <span className={styles.kpiValue}>
                                {classStats.subjectsBreakdown.length}
                            </span>
                            <span className={styles.kpiLabel}>מקצועות נלמדים</span>
                        </div>
                        <div className={`${styles.kpiCard} ${styles.kpiGreen}`}>
                            <span className={styles.kpiValue}>
                                {classStats.teachersTeam.length}
                            </span>
                            <span className={styles.kpiLabel}>מורים</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Scrollable Subjects Section for Teacher */}
            {currentMode === "teacher" && (
                <div className={styles.scrollableContent} ref={scrollableRef}>
                    {!teacherStats ? (
                        <div className={styles.emptyState}>יש לבחור מורה כדי להציג נתונים</div>
                    ) : teacherStats.subjectsBreakdown.length === 0 ? (
                        <div className={styles.emptyState}>אין שיעורים משובצים למורה זה במערכת</div>
                    ) : (
                        <div className={styles.itemList}>
                            {teacherStats.subjectsBreakdown.map((item) => (
                                <div key={item.subjectId} className={styles.itemRow}>
                                    <div className={styles.itemMain}>
                                        <span className={styles.itemName}>{item.subjectName}</span>
                                        <span className={styles.itemHoursBadge}>
                                            {`${item.totalHours} ש"ש`}
                                        </span>
                                    </div>
                                    {item.classes.length > 0 && (
                                        <div className={styles.itemSubDetails}>
                                            {item.classes.map((c) => (
                                                <span key={c.classId} className={styles.classTag}>
                                                    {`${c.className} (${c.hours} ש"ש)`}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Scrollable Subjects Section for Class */}
            {currentMode === "class" && (
                <div className={styles.scrollableContent} ref={scrollableRef}>
                    {!classStats ? (
                        <div className={styles.emptyState}>יש לבחור כיתה כדי להציג נתונים</div>
                    ) : classStats.subjectsBreakdown.length === 0 ? (
                        <div className={styles.emptyState}>אין שעות משובצות לכיתה זו במערכת</div>
                    ) : (
                        <div className={styles.itemList}>
                            {classStats.subjectsBreakdown.map((item) => (
                                <div key={item.subjectId} className={styles.itemRow}>
                                    <div className={styles.itemMain}>
                                        <span className={styles.itemName}>{item.subjectName}</span>
                                        <span className={styles.itemHoursBadge}>
                                            {`${item.hours} ש"ש`}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AnnualScheduleInfoPopup;
