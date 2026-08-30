"use client";

import React, { useEffect } from "react";
import { WeeklySchedule } from "@/models/types/annualSchedule";
import { SubjectRequest, SubjectType } from "@/models/types/subjects";
import { TeacherRequest, TeacherRoleValues, TeacherType } from "@/models/types/teachers";
import { ClassType } from "@/models/types/classes";
import { useMainContext } from "@/context/MainContext";
import { errorToast, successToast } from "@/lib/toast";
import messages from "@/resources/messages";
import { DAYS_OF_WORK_WEEK } from "@/utils/time";
import MngrAnnualBldByClassRow from "../MngrAnnualBldByClassRow/MngrAnnualBldByClassRow";
import styles from "./MngrAnnualBldByClassTable.module.css";
import { AnnualInputCellType } from "@/models/types/annualSchedule";
import { SelectMethod } from "@/models/types/actions";
import { logErrorAction } from "@/app/actions/POST/logErrorAction";
import Icons from "@/style/icons";
import { useRouter, useSearchParams } from "next/navigation";
import { useValidation } from "@/context/ValidationContext";
import { usePopup, PopupAction } from "@/context/PopupContext";
import ConfirmPopup from "@/components/popups/ConfirmPopup/ConfirmPopup";
import { removeIncompleteCells } from "@/utils/scheduleValidation";
import { useAnnualByClass } from "@/context/AnnualByClassContext";

type MngrAnnualBldByClassTableProps = {
    schedule: WeeklySchedule;
    selectedClassId: string;
    subjects: SubjectType[] | undefined;
    teachers: TeacherType[] | undefined;
    classes: ClassType[] | undefined;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    setIsSaving: React.Dispatch<React.SetStateAction<boolean>>;
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

const MngrAnnualBldByClassTable: React.FC<MngrAnnualBldByClassTableProps> = ({
    schedule,
    selectedClassId,
    subjects,
    teachers,
    classes,
    setIsLoading,
    setIsSaving,
    isSaving,
    handleScheduleUpdate,
}) => {
    const { school, addNewTeacher, addNewSubject } = useMainContext();
    const { setSchedule } = useAnnualByClass();
    const { validate } = useValidation();
    const { openPopup } = usePopup();
    const nav = useRouter();
    const searchParams = useSearchParams();

    const isDisabled = isSaving || !schedule || !subjects || !classes;

    useEffect(() => {
        setIsLoading(!schedule || !subjects || !classes);
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                        text="שימו ❤️: שעות ללא שיוך מלא (מורה + מקצוע) לא יישמרו."
                        yesText="להישאר במסך ולתקן"
                        noText="להמשיך ללא שמירה"
                        onYes={async () => {
                            resolve(false);
                        }}
                        onNo={() => {
                            const cleanedSchedule = removeIncompleteCells(schedule, "class");
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
                if (selectedClassId) params.set("classId", selectedClassId);
                if (schoolId) params.set("schoolId", schoolId);
                const qs = params.toString();
                nav.push(`/annual-view${qs ? `?${qs}` : ""}`);
            }
        });
    };

    const handleCreateTeacher = async (day: string, hour: number, value: string) => {
        if (!school?.id) return;
        setIsSaving(true);
        try {
            const newTeacher: TeacherRequest = {
                name: value,
                role: TeacherRoleValues.REGULAR,
                schoolId: school.id,
            };
            const res = await addNewTeacher(newTeacher);
            if (res) {
                await handleScheduleUpdate("teachers", [res.id], day, hour, "create-option", res);
                successToast(messages.teachers.createSuccess);
                return res.id;
            }
            errorToast(messages.teachers.createError);
        } catch (error) {
            logErrorAction({ description: `Error creating teacher (annual table): ${error instanceof Error ? error.message : String(error)}`, schoolId: school.id });
            errorToast(messages.teachers.createError);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCreateSubject = async (day: string, hour: number, value: string) => {
        if (!school?.id) return;
        setIsSaving(true);
        try {
            const newSubject: SubjectRequest = { name: value, schoolId: school.id };
            const res = await addNewSubject(newSubject);
            if (res) {
                await handleScheduleUpdate("subjects", [res.id], day, hour, "create-option", res);
                successToast(messages.subjects.createSuccess);
                return res.id;
            }
            errorToast(messages.subjects.createError);
        } catch (error) {
            logErrorAction({ description: `Error creating subject (annual table): ${error instanceof Error ? error.message : String(error)}`, schoolId: school.id });
            errorToast(messages.subjects.createError);
        } finally {
            setIsSaving(false);
        }
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
                                <div className={styles.headerInner}>
                                    {`יום ${day}'`}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className={styles.scheduleTableBody}>
                    {Array.from({ length: (school?.toHour ?? 10) - (school?.fromHour ?? 1) + 1 }, (_, i) => (school?.fromHour ?? 1) + i).map((hour) => (
                        <MngrAnnualBldByClassRow
                            key={hour}
                            hour={hour}
                            isDisabled={isDisabled}
                            schedule={schedule}
                            selectedClassId={selectedClassId}
                            subjects={subjects || []}
                            teachers={teachers || []}
                            classes={classes || []}
                            onCreateSubject={handleCreateSubject}
                            onCreateTeacher={handleCreateTeacher}
                            handleScheduleUpdate={handleScheduleUpdate}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default MngrAnnualBldByClassTable;
