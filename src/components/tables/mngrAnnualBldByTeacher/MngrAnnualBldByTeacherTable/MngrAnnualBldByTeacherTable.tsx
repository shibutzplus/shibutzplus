"use client";

import React, { useEffect } from "react";
import { WeeklySchedule } from "@/models/types/annualSchedule";
import { SubjectType } from "@/models/types/subjects";
import { TeacherType } from "@/models/types/teachers";
import { ClassType } from "@/models/types/classes";
import { DAYS_OF_WORK_WEEK } from "@/utils/time";
import MngrAnnualBldByTeacherRow from "../MngrAnnualBldByTeacherRow/MngrAnnualBldByTeacherRow";
import styles from "./MngrAnnualBldByTeacherTable.module.css";
import { AnnualInputCellType } from "@/models/types/annualSchedule";
import { SelectMethod } from "@/models/types/actions";
import { useMainContext } from "@/context/MainContext";
import Icons from "@/style/icons";
import { useRouter, useSearchParams } from "next/navigation";
import { useValidation } from "@/context/ValidationContext";
import { usePopup, PopupAction } from "@/context/PopupContext";
import ConfirmPopup from "@/components/popups/ConfirmPopup/ConfirmPopup";
import { removeIncompleteCells } from "@/utils/scheduleValidation";
import { useAnnualByTeacher } from "@/context/AnnualByTeacherContext";

type MngrAnnualBldByTeacherTableProps = {
    schedule: WeeklySchedule;
    selectedTeacherId: string;
    subjects: SubjectType[] | undefined;
    teachers: TeacherType[] | undefined;
    classes: ClassType[] | undefined;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    isSaving: boolean;
    handleScheduleUpdate: (
        type: AnnualInputCellType,
        elementIds: string[],
        day: string,
        hour: number,
        method: SelectMethod,
        newElementObj?: TeacherType | SubjectType,
    ) => Promise<void>;
};

const MngrAnnualBldByTeacherTable: React.FC<MngrAnnualBldByTeacherTableProps> = ({
    schedule,
    selectedTeacherId,
    subjects,
    teachers,
    classes,
    setIsLoading,
    isSaving,
    handleScheduleUpdate,
}) => {
    const { school } = useMainContext();
    const { setSchedule } = useAnnualByTeacher();
    const { validate } = useValidation();
    const { openPopup } = usePopup();
    const nav = useRouter();
    const searchParams = useSearchParams();

    const isDisabled = isSaving || !schedule || !subjects || !classes;

    useEffect(() => {
        setIsLoading(!schedule || !subjects || !classes);
    }, [!!schedule, !!subjects, !!classes]);

    const handleBeforeMenuOpen = (): Promise<boolean> => {
        return new Promise((resolve) => {
            if (validate()) {
                resolve(true);
            } else {
                openPopup(
                    PopupAction.msgPopup,
                    "S",
                    <ConfirmPopup
                        text="שימו ❤️: שעות ללא שיוך מלא (מקצוע + כיתה) לא יישמרו."
                        showIcon={false}
                        yesText="להישאר במסך ולתקן"
                        noText="להמשיך ללא שמירה"
                        onYes={async () => {
                            resolve(false);
                        }}
                        onNo={() => {
                            const cleanedSchedule = removeIncompleteCells(schedule, "teacher");
                            setSchedule(cleanedSchedule);
                            resolve(true);
                        }}
                        defaultAnswer="yes"
                    />
                );
            }
        });
    };

    const handleNavigateToView = () => {
        handleBeforeMenuOpen().then((shouldProceed) => {
            if (shouldProceed) {
                const schoolId = searchParams.get("schoolId");
                const params = new URLSearchParams();
                if (selectedTeacherId) params.set("teacherId", selectedTeacherId);
                if (schoolId) params.set("schoolId", schoolId);
                const qs = params.toString();
                nav.push(`/annual-view${qs ? `?${qs}` : ""}`);
            }
        });
    };

    return (
        <div className={styles.tableContainer}>
            <table className={styles.scheduleTable}>
                <thead>
                    <tr>
                        <th className={`${styles.headerCell} ${styles.hoursColumn}`}>
                            <div className={`${styles.headerInner} ${styles.hoursHeader}`}>
                                <button
                                    type="button"
                                    className={styles.tableViewBtn}
                                    onClick={handleNavigateToView}
                                    title="חזרה למצב צפייה במערכת"
                                    aria-label="חזרה למצב צפייה במערכת"
                                >
                                    <Icons.eye size={18} />
                                </button>
                            </div>
                        </th>
                        <th className={styles.emptyColSeparator}></th>
                        {DAYS_OF_WORK_WEEK.map((day) => (
                            <th key={day} className={styles.headerCell}>
                                <div className={styles.headerInner}>{`יום ${day}'`}</div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className={styles.scheduleTableBody}>
                    {Array.from({ length: (school?.toHour ?? 10) - (school?.fromHour ?? 1) + 1 }, (_, i) => (school?.fromHour ?? 1) + i).map(
                        (hour) => (
                            <MngrAnnualBldByTeacherRow
                                key={hour}
                                hour={hour}
                                isDisabled={isDisabled}
                                schedule={schedule}
                                selectedTeacherId={selectedTeacherId}
                                subjects={subjects || []}
                                teachers={teachers || []}
                                classes={classes || []}
                                handleScheduleUpdate={handleScheduleUpdate}
                            />
                        ),
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default MngrAnnualBldByTeacherTable;
