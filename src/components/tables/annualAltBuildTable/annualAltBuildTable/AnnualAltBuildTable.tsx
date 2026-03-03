"use client";

import React from "react";
import { WeeklySchedule } from "@/models/types/annualSchedule";
import { SubjectRequest, SubjectType } from "@/models/types/subjects";
import { TeacherRequest, TeacherRoleValues, TeacherType } from "@/models/types/teachers";
import { ClassType } from "@/models/types/classes";
import { useMainContext } from "@/context/MainContext";
import { errorToast, successToast } from "@/lib/toast";
import messages from "@/resources/messages";
import AnnualCellAlt from "../AnnualCellAlt/AnnualCellAlt";
import styles from "./AnnualAltBuildTable.module.css";
import { AnnualInputCellType } from "@/models/types/annualSchedule";
import { SelectMethod } from "@/models/types/actions";
import { logErrorAction } from "@/app/actions/POST/logErrorAction";

type AnnualAltBuildTableProps = {
    schedule: WeeklySchedule;
    selectedDay: string;
    subjects: SubjectType[] | undefined;
    teachers: TeacherType[] | undefined;
    classes: ClassType[] | undefined;
    isDisabled: boolean;
    handleScheduleUpdate: (
        type: AnnualInputCellType,
        elementIds: string[],
        day: string,
        hour: number,
        method: SelectMethod,
        classId: string,
        newElementObj?: TeacherType | SubjectType,
    ) => Promise<void>;
};

const AnnualAltBuildTable: React.FC<AnnualAltBuildTableProps> = ({
    schedule,
    selectedDay,
    subjects,
    teachers,
    classes,
    isDisabled,
    handleScheduleUpdate,
}) => {
    const { school, addNewTeacher, addNewSubject } = useMainContext();

    // Remove useEffect for setIsLoading since it's now handled by the parent

    // Wrap handleScheduleUpdate to bind classId per-cell
    const makeHandleUpdate = (classId: string) => (
        type: AnnualInputCellType,
        elementIds: string[],
        day: string,
        hour: number,
        method: SelectMethod,
        newElementObj?: TeacherType | SubjectType,
    ) => handleScheduleUpdate(type, elementIds, day, hour, method, classId, newElementObj);

    const makeHandleCreateTeacher = (classId: string) => async (day: string, hour: number, value: string) => {
        if (!school?.id) return;
        try {
            const newTeacher: TeacherRequest = {
                name: value,
                role: TeacherRoleValues.REGULAR,
                schoolId: school.id,
            };
            const res = await addNewTeacher(newTeacher);
            if (res) {
                await handleScheduleUpdate("teachers", [res.id], day, hour, "create-option", classId, res);
                successToast(messages.teachers.createSuccess);
                return res.id;
            }
            errorToast(messages.teachers.createError);
        } catch (error) {
            logErrorAction({ description: `Error creating teacher (alt table): ${error instanceof Error ? error.message : String(error)}`, schoolId: school.id });
            errorToast(messages.teachers.createError);
        }
    };

    const makeHandleCreateSubject = (classId: string) => async (day: string, hour: number, value: string) => {
        if (!school?.id) return;
        try {
            const newSubject: SubjectRequest = { name: value, schoolId: school.id };
            const res = await addNewSubject(newSubject);
            if (res) {
                await handleScheduleUpdate("subjects", [res.id], day, hour, "create-option", classId, res);
                successToast(messages.subjects.createSuccess);
                return res.id;
            }
            errorToast(messages.subjects.createError);
        } catch (error) {
            logErrorAction({ description: `Error creating subject (alt table): ${error instanceof Error ? error.message : String(error)}`, schoolId: school.id });
            errorToast(messages.subjects.createError);
        }
    };

    const displayedClasses = (classes || []).filter((cls) => !cls.activity);

    return (
        <div className={styles.tableContainer}>
            <table className={styles.scheduleTable}>
                <thead>
                    <tr>
                        <th className={`${styles.headerCell} ${styles.hoursColumn}`}>
                            <div className={`${styles.headerInner} ${styles.hoursHeader}`}></div>
                        </th>
                        <th className={styles.emptyColSeparator}></th>
                        {displayedClasses.map((cls) => (
                            <th key={cls.id} className={`${styles.headerCell} ${styles.classColumn}`}>
                                <div className={styles.headerInner}>
                                    {cls.name}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className={styles.scheduleTableBody}>
                    {Array.from(
                        { length: (school?.toHour ?? 10) - (school?.fromHour ?? 1) + 1 },
                        (_, i) => (school?.fromHour ?? 1) + i
                    ).map((hour) => (
                        <tr key={hour}>
                            <td className={styles.hoursColumn}>
                                <div className={styles.hourCell}>{hour}</div>
                            </td>
                            <td className={styles.emptyColSeparator}></td>
                            {displayedClasses.map((cls) => (
                                <AnnualCellAlt
                                    key={`${cls.id}-${hour}`}
                                    day={selectedDay}
                                    hour={hour}
                                    schedule={schedule}
                                    selectedClassId={cls.id}
                                    subjects={subjects || []}
                                    teachers={teachers || []}
                                    classes={classes || []}
                                    isDisabled={isDisabled}
                                    onCreateSubject={makeHandleCreateSubject(cls.id)}
                                    onCreateTeacher={makeHandleCreateTeacher(cls.id)}
                                    handleScheduleUpdate={makeHandleUpdate(cls.id)}
                                />
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AnnualAltBuildTable;
