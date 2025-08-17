"use client";

import React, { useState, useEffect, useMemo } from "react";
import styles from "./annualSchedule.module.css";
import { NextPage } from "next";
import { useMainContext } from "@/context/MainContext";
import DynamicInputSelect from "@/components/ui/InputSelect/DynamicInputSelect";
import { createSelectOptions, sortByHebrewName } from "@/utils/format";
import { TeacherRequest, TeacherRoleValues, TeacherType } from "@/models/types/teachers";
import { SubjectRequest, SubjectType } from "@/models/types/subjects";
import { WeeklySchedule, AnnualScheduleRequest } from "@/models/types/annualSchedule";
import { DAYS_OF_WEEK, dayToNumber } from "@/utils/time";
import messages from "@/resources/messages";
import { useTopNav } from "@/context/TopNavContext";
import { errorToast, successToast } from "@/lib/toast";
import {
    getRowId,
    getSelectedElements,
    setNewScheduleTemplate,
} from "@/services/ annualScheduleService";
import { TableRows } from "@/models/constant/table";
import { populateAnnualSchedule } from "@/utils/schedule";
import { initializeEmptyAnnualSchedule } from "@/utils/Initialize";
import { sortTeachersForSchedule } from "@/utils/teachers";

const AnnualSchedulePage: NextPage = () => {
    const {
        classes,
        teachers,
        subjects,
        annualScheduleTable,
        school,
        addNewTeacher,
        addNewSubject,
        addNewAnnualScheduleItem,
        updateExistingAnnualScheduleItem,
    } = useMainContext();

    const { selectedClassId, getSelectedClass } = useTopNav();

    const [schedule, setSchedule] = useState<WeeklySchedule>({});

    const [isLoading, setIsLoading] = useState(false);

    // TODO: add loading in the cell

    // Initialize schedule for the selected class
    // If annualScheduleTable has data, populate the schedule with it
    useEffect(() => {
        if (!schedule[selectedClassId]) {
            let newSchedule = { ...schedule };
            newSchedule = initializeEmptyAnnualSchedule(newSchedule, selectedClassId);
            newSchedule = populateAnnualSchedule(annualScheduleTable, selectedClassId, newSchedule);
            setSchedule(newSchedule);
        }
    }, [selectedClassId, schedule, annualScheduleTable]);

    const addNewRow = async (
        type: "teacher" | "subject",
        elementId: string,
        day: string,
        hour: number,
        isNew?: TeacherType | SubjectType,
    ) => {
        if (!school?.id) return;
        let newSchedule = { ...schedule };
        setIsLoading(true);

        try {
            newSchedule = setNewScheduleTemplate(newSchedule, selectedClassId, day, hour);
            // Check if the type selected is already filled
            const isAlreadyFilled = newSchedule[selectedClassId][day][hour][type];

            // If not already filled, fill it and get the IDs
            newSchedule[selectedClassId][day][hour][type] = elementId;
            const teacherId = schedule[selectedClassId][day][hour].teacher;
            const subjectId = schedule[selectedClassId][day][hour].subject;
            setSchedule(newSchedule);

            const selectedClassObj = getSelectedClass();
            const { selectedTeacher, selectedSubject } = getSelectedElements(
                teacherId,
                subjectId,
                type,
                isNew,
                subjects,
                teachers,
            );

            let response: any;
            if (selectedClassObj && selectedTeacher && selectedSubject) {
                const scheduleRequest: AnnualScheduleRequest = {
                    day: dayToNumber(day),
                    hour: hour,
                    school: school,
                    class: selectedClassObj,
                    teacher: selectedTeacher,
                    subject: selectedSubject,
                };

                if (isAlreadyFilled) {
                    // Check if the other type select is filled
                    if ((type === "teacher" && subjectId) || (type === "subject" && teacherId)) {
                        // If both already filled -> Update the cell function
                        const id = getRowId(annualScheduleTable, selectedClassId, day, hour);
                        response = await updateExistingAnnualScheduleItem(id, scheduleRequest);
                    }
                } else {
                    // Check if the other type select is filled
                    if (teacherId && subjectId) {
                        // If both fresh filled -> Create new cell function
                        response = await addNewAnnualScheduleItem(scheduleRequest);
                    }
                }
                if (response) {
                    successToast(messages.annualSchedule.createSuccess);
                } else {
                    errorToast(messages.annualSchedule.createError);
                }
            }
        } catch (err) {
            errorToast(messages.annualSchedule.createError);
            console.error("Error adding schedule item:", err);
        } finally {
            setIsLoading(false);
        }
    };

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
        <div className={styles.container}>
            <div className={styles.whiteBox}>
                <div className={styles.tableContainer}>
                    <table className={styles.scheduleTable}>
                        <thead>
                            <tr>
                                <th className={styles.hourHeader}></th>
                                {DAYS_OF_WEEK.map((day) => (
                                    <th key={day} className={styles.dayHeader}>
                                        יום {day}׳
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: TableRows }, (_, i) => i + 1).map((hour) => (
                                <tr key={hour}>
                                    <td className={styles.hourCell}>{hour}</td>
                                    {DAYS_OF_WEEK.map((day) => (
                                        <td key={`${day}-${hour}`} className={styles.scheduleCell}>
                                            <div className={styles.cellContent}>
                                                <DynamicInputSelect
                                                    placeholder="מקצוע"
                                                    options={createSelectOptions<SubjectType>(
                                                        sortByHebrewName(subjects || []),
                                                    )}
                                                    value={
                                                        schedule[selectedClassId]?.[day]?.[hour]
                                                            ?.subject || ""
                                                    }
                                                    onChange={(value: string) =>
                                                        handleSubjectChange(day, hour, value)
                                                    }
                                                    onCreate={(value: string) =>
                                                        handleCreateSubject(day, hour, value)
                                                    }
                                                    isSearchable
                                                    allowAddNew
                                                />
                                                <DynamicInputSelect
                                                    placeholder="מורה"
                                                    options={sortTeachersForSchedule(
                                                        teachers || [],
                                                        classes || [],
                                                        schedule,
                                                        selectedClassId,
                                                        day,
                                                        hour
                                                    )}
                                                    value={
                                                        schedule[selectedClassId]?.[day]?.[hour]
                                                            ?.teacher || ""
                                                    }
                                                    onChange={(value: string) =>
                                                        handleTeacherChange(day, hour, value)
                                                    }
                                                    onCreate={(value: string) =>
                                                        handleCreateTeacher(day, hour, value)
                                                    }
                                                    isSearchable
                                                    allowAddNew
                                                />
                                            </div>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AnnualSchedulePage;
