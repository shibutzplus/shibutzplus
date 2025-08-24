"use client";

import React, { useEffect } from "react";
import styles from "./AnnualTable.module.css";
import AnnualHeader from "../AnnualHeader/AnnualHeader";
import AnnualRow from "../AnnualRow/AnnualRow";
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
    subjects: SubjectType[] | undefined;
    teachers: TeacherType[] | undefined;
    classes: ClassType[] | undefined;
    addNewRow: (
        type: "teachers" | "subjects",
        elementIds: string[],
        day: string,
        hour: number,
        isNew?: TeacherType | SubjectType,
    ) => Promise<void>;
    removeRow: (
        type: "teachers" | "subjects",
        elementIds: string[],
        removedValue: string,
        day: string,
        hour: number,
    ) => Promise<void>;
};

const AnnualTable: React.FC<AnnualTableProps> = ({
    schedule,
    selectedClassId,
    subjects,
    teachers,
    classes,
    addNewRow,
    removeRow,
}) => {
    const { school, addNewTeacher, addNewSubject } = useMainContext();
    const { setIsLoading, setIsSaving, isSaving } = useAnnualTable();

    const isDisabled = isSaving || !schedule || !selectedClassId || !subjects || !classes;

    useEffect(() => {
        setIsLoading(!schedule || !selectedClassId || !subjects || !classes ? true : false);
    }, [schedule, selectedClassId, subjects, classes]);

    const handleTeacherChange = async (
        day: string,
        hour: number,
        value: string[],
        removed?: string,
    ) => {
        if (removed) {
            await removeRow("teachers", value, removed, day, hour);
        } else {
            await addNewRow("teachers", value, day, hour);
        }
    };

    const handleSubjectChange = async (
        day: string,
        hour: number,
        value: string[],
        removed?: string,
    ) => {
        if (removed) {
            await removeRow("subjects", value, removed, day, hour);
        } else {
            await addNewRow("subjects", value, day, hour);
        }
    };

    const handleCreateTeacher = async (day: string, hour: number, value: string) => {
        if (!school?.id) return;
        setIsSaving(true);

        try {
            const newTeacher: TeacherRequest = {
                name: value,
                role: TeacherRoleValues.REGULAR,
                schoolId: school.id,
                userId: null,
            };

            const res = await addNewTeacher(newTeacher);
            if (res) {
                await addNewRow("teachers", [res.id], day, hour, res);
                successToast(messages.teachers.createSuccess);
                return res.id;
            }
            errorToast(messages.teachers.createError);
        } catch (error) {
            console.error(error);
            errorToast(messages.teachers.createError);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCreateSubject = async (day: string, hour: number, value: string) => {
        if (!school?.id) return;
        setIsSaving(true);

        try {
            const newSubject: SubjectRequest = {
                name: value,
                schoolId: school.id,
            };

            const res = await addNewSubject(newSubject);
            if (res) {
                await addNewRow("subjects", [res.id], day, hour, res);
                successToast(messages.subjects.createSuccess);
                return res.id;
            }
            errorToast(messages.subjects.createError);
        } catch (error) {
            console.error(error);
            errorToast(messages.subjects.createError);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className={styles.tableContainer}>
            <table className={styles.scheduleTable}>
                <AnnualHeader />
                <tbody>
                    {Array.from({ length: TableRows }, (_, i) => i + 1).map((hour) => (
                        <AnnualRow
                            key={hour}
                            hour={hour}
                            isDisabled={isDisabled}
                            schedule={schedule}
                            selectedClassId={selectedClassId}
                            subjects={subjects || []}
                            teachers={teachers || []}
                            classes={classes || []}
                            onSubjectChange={handleSubjectChange}
                            onTeacherChange={handleTeacherChange}
                            onCreateSubject={handleCreateSubject}
                            onCreateTeacher={handleCreateTeacher}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AnnualTable;
