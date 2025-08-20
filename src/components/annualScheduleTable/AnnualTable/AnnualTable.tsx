"use client";

import React, { useState } from "react";
import styles from "./AnnualTable.module.css";
import AnnualScheduleHeader from "../AnnualHeader/AnnualHeader";
import AnnualScheduleRow from "../AnnualRow/AnnualRow";
import { WeeklySchedule } from "@/models/types/annualSchedule";
import { SubjectRequest, SubjectType } from "@/models/types/subjects";
import { TeacherRequest, TeacherRoleValues, TeacherType } from "@/models/types/teachers";
import { ClassType } from "@/models/types/classes";
import { TableRows } from "@/models/constant/table";
import { useMainContext } from "@/context/MainContext";
import messages from "@/resources/messages";
import { errorToast, successToast } from "@/lib/toast";
import { useAnnualTable } from "@/context/AnnualTableContext";

type AnnualTableProps = {
    schedule: WeeklySchedule;
    selectedClassId: string;
    subjects: SubjectType[];
    teachers: TeacherType[];
    classes: ClassType[];
    addNewRow: (
        type: "teacher" | "subject",
        elementId: string,
        day: string,
        hour: number,
        isNew?: TeacherType | SubjectType,
    ) => Promise<void>;
};

const AnnualTable: React.FC<AnnualTableProps> = (props) => {
    const { school, addNewTeacher, addNewSubject } = useMainContext();
    const { setIsLoading } = useAnnualTable();
    const { addNewRow } = props;

    const handleTeacherChange = async (day: string, hour: number, value: string) => {
        await addNewRow("teacher", value, day, hour);
    };

    const handleSubjectChange = async (day: string, hour: number, value: string) => {
        await addNewRow("subject", value, day, hour);
    };

    const handleCreateTeacher = async (day: string, hour: number, value: string) => {
        if (!school?.id) return;
        setIsLoading(true);

        try {
            const newTeacher: TeacherRequest = {
                name: value,
                role: TeacherRoleValues.REGULAR,
                schoolId: school.id,
                userId: null,
            };

            const res = await addNewTeacher(newTeacher);
            if (res) {
                await addNewRow("teacher", res.id, day, hour, res);
                successToast(messages.teachers.createSuccess);
                return res.id;
            }
            errorToast(messages.teachers.createError);
        } catch (error) {
            console.error(error);
            errorToast(messages.teachers.createError);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateSubject = async (day: string, hour: number, value: string) => {
        if (!school?.id) return;
        setIsLoading(true);

        try {
            const newSubject: SubjectRequest = {
                name: value,
                schoolId: school.id,
            };

            const res = await addNewSubject(newSubject);
            if (res) {
                await addNewRow("subject", res.id, day, hour, res);
                successToast(messages.subjects.createSuccess);
                return res.id;
            }
            errorToast(messages.subjects.createError);
        } catch (error) {
            console.error(error);
            errorToast(messages.subjects.createError);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.tableContainer}>
            <table className={styles.scheduleTable}>
                <AnnualScheduleHeader />
                <tbody>
                    {Array.from({ length: TableRows }, (_, i) => i + 1).map((hour) => (
                        <AnnualScheduleRow
                            key={hour}
                            hour={hour}
                            onSubjectChange={handleSubjectChange}
                            onTeacherChange={handleTeacherChange}
                            onCreateSubject={handleCreateSubject}
                            onCreateTeacher={handleCreateTeacher}
                            {...props}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AnnualTable;
