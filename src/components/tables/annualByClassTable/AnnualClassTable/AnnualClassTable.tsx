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
import AnnualRow from "../AnnualRow/AnnualRow";
import styles from "./AnnualClassTable.module.css";
import { AnnualInputCellType } from "@/models/types/annualSchedule";
import { SelectMethod } from "@/models/types/actions";
import { logErrorAction } from "@/app/actions/POST/logErrorAction";

type AnnualClassTableProps = {
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

const AnnualClassTable: React.FC<AnnualClassTableProps> = ({
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

    const isDisabled = isSaving || !schedule || !subjects || !classes;

    useEffect(() => {
        setIsLoading(!schedule || !subjects || !classes);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [!!schedule, !!subjects, !!classes]);

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
                            <div className={`${styles.headerInner} ${styles.hoursHeader}`}></div>
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
                        <AnnualRow
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

export default AnnualClassTable;
