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
import { SelectMethod } from "@/models/types/actions";

type AnnualTableProps = {
    schedule: WeeklySchedule;
    selectedClassId: string;
    subjects: SubjectType[] | undefined;
    teachers: TeacherType[] | undefined;
    classes: ClassType[] | undefined;
};

const AnnualTable: React.FC<AnnualTableProps> = ({
    schedule,
    selectedClassId,
    subjects,
    teachers,
    classes,
}) => {
    const { school, addNewTeacher, addNewSubject } = useMainContext();
    const { setIsLoading, setIsSaving, isSaving, handleAddNewRow } = useAnnualTable();

    const isDisabled = isSaving || !schedule || !selectedClassId || !subjects || !classes;

    useEffect(() => {
        setIsLoading(!schedule || !selectedClassId || !subjects || !classes ? true : false);
    }, [schedule, selectedClassId, subjects, classes]);

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
                await handleAddNewRow("teachers", [res.id], day, hour, "create-option");
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
                await handleAddNewRow("subjects", [res.id], day, hour, "create-option");
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
