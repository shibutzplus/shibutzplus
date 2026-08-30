"use client";

import React, { useState, useRef, useEffect } from "react";
import { WeeklySchedule } from "@/models/types/annualSchedule";
import { SubjectType } from "@/models/types/subjects";
import { TeacherType } from "@/models/types/teachers";
import { ClassType } from "@/models/types/classes";
import { DAYS_OF_WORK_WEEK } from "@/utils/time";
import MngrAnnualViewRow from "../MngrAnnualViewRow/MngrAnnualViewRow";
import styles from "./MngrAnnualViewTable.module.css";
import { useMainContext } from "@/context/MainContext";
import { getAnnualScheduleDimensions } from "@/utils/annualCellDisplay";
import Icons from "@/style/icons";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

type MngrAnnualViewTableProps = {
    schedule: WeeklySchedule;
    selectedClassId: string;
    selectedTeacherId: string;
    subjects: SubjectType[] | undefined;
    teachers: TeacherType[] | undefined;
    classes: ClassType[] | undefined;
};

const MngrAnnualViewTable: React.FC<MngrAnnualViewTableProps> = ({
    schedule,
    selectedClassId,
    selectedTeacherId,
    subjects,
    teachers,
    classes,
}) => {
    const { settings } = useMainContext();
    const fromHour = settings?.fromHour ?? 1;
    const toHour = settings?.toHour ?? 10;
    const isDisabled = !schedule || !subjects || !classes;

    const nav = useRouter();
    const searchParams = useSearchParams();
    const { data: session } = useSession();
    const isDemo = session?.user?.isDemo;

    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };
        if (menuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuOpen]);

    const handleEditClass = () => {
        setMenuOpen(false);
        const schoolId = searchParams.get("schoolId");
        const params = new URLSearchParams();
        if (selectedClassId) params.set("classId", selectedClassId);
        if (schoolId) params.set("schoolId", schoolId);
        const qs = params.toString();
        nav.push(`/annual-build-class${qs ? `?${qs}` : ""}`);
    };

    const handleEditTeacher = () => {
        setMenuOpen(false);
        const schoolId = searchParams.get("schoolId");
        const params = new URLSearchParams();
        if (selectedTeacherId) params.set("teacherId", selectedTeacherId);
        if (schoolId) params.set("schoolId", schoolId);
        const qs = params.toString();
        nav.push(`/annual-build-teacher${qs ? `?${qs}` : ""}`);
    };

    const handleEditClick = () => {
        if (isDemo) return;
        if (selectedClassId && selectedTeacherId) {
            setMenuOpen((prev) => !prev);
        } else if (selectedClassId) {
            handleEditClass();
        } else if (selectedTeacherId) {
            handleEditTeacher();
        }
    };

    const selectedClassName = classes?.find((c) => c.id === selectedClassId)?.name;
    const selectedTeacherName = teachers?.find((t) => t.id === selectedTeacherId)?.name;

    // Calculate rows to display dynamically based on content
    const { rowsCount } = getAnnualScheduleDimensions(
        schedule,
        selectedClassId,
        selectedTeacherId,
        toHour,
        fromHour
    );

    return (
        <div className={styles.tableContainer}>
            <table className={styles.scheduleTable}>
                <thead>
                    <tr>
                        <th className={`${styles.headerCell} ${styles.hoursColumn}`}>
                            <div className={`${styles.headerInner} ${styles.hoursHeader}`}>
                                {(selectedClassId || selectedTeacherId) && (
                                    <div className={styles.editWrapper} ref={menuRef}>
                                        <button
                                            type="button"
                                            className={styles.tableEditBtn}
                                            onClick={handleEditClick}
                                            disabled={isDemo}
                                            title={
                                                selectedClassId && selectedTeacherId
                                                    ? "עריכת מערכת (כיתה / מורה)"
                                                    : selectedClassId
                                                    ? "עריכת מערכת כיתה"
                                                    : "עריכת מערכת מורה"
                                            }
                                            aria-label="עריכת מערכת"
                                        >
                                            <Icons.edit size={18} />
                                        </button>

                                        {menuOpen && selectedClassId && selectedTeacherId && (
                                            <div className={styles.editDropdownMenu}>
                                                <button
                                                    type="button"
                                                    className={styles.editDropdownItem}
                                                    onClick={handleEditClass}
                                                >
                                                    <Icons.edit size={14} />
                                                    <span>ערוך כיתה {selectedClassName ? `(${selectedClassName})` : ""}</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    className={styles.editDropdownItem}
                                                    onClick={handleEditTeacher}
                                                >
                                                    <Icons.edit size={14} />
                                                    <span>ערוך מורה {selectedTeacherName ? `(${selectedTeacherName})` : ""}</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </th>
                        <th className={styles.emptyColSeparator}></th>
                        {DAYS_OF_WORK_WEEK.map((day) => (
                            <th key={day} className={styles.headerCell}>
                                <div className={styles.headerInner}>
                                    {`יום ${day}'`}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className={styles.scheduleTableBody}>
                    {Array.from({ length: rowsCount }, (_, i) => i + fromHour).map((hour) => (
                        <MngrAnnualViewRow
                            key={hour}
                            hour={hour}
                            isDisabled={isDisabled}
                            schedule={schedule}
                            selectedClassId={selectedClassId}
                            selectedTeacherId={selectedTeacherId}
                            subjects={subjects || []}
                            teachers={teachers || []}
                            classes={classes || []}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default MngrAnnualViewTable;
