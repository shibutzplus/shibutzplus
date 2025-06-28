"use client";

import React, { useState, useEffect } from "react";
import styles from "./annualSchedule.module.css";
import { NextPage } from "next";
import { useMainContext } from "@/context/MainContext";
import DynamicInputSelect from "@/components/ui/InputSelect/DynamicInputSelect";
import { createSelectOptions } from "@/utils/format";
import { TeacherType } from "@/models/types/teachers";
import { SubjectType } from "@/models/types/subjects";
import { WeeklySchedule, AnnualScheduleRequest } from "@/models/types/annualSchedule";
import { DAYS_OF_WEEK, HOURS_IN_DAY } from "@/utils/time";
import messages from "@/resources/messages";
import { useActions } from "@/context/ActionsContext";

const AnnualSchedulePage: NextPage = () => {
    const {
        classes, // move to useActions
        teachers,
        subjects,
        annualScheduleTable,
        school,
        addNewAnnualScheduleItem,
        updateExistingAnnualScheduleItem,
    } = useMainContext();

    const { selectedClassId } = useActions();

    const [schedule, setSchedule] = useState<WeeklySchedule>({});

    const [isLoading, setIsLoading] = useState(false); // TODO: add loading in the cell
    const [error, setError] = useState("");

    // Initialize schedule for the selected class
    // If annualScheduleTable has data, populate the schedule with it
    useEffect(() => {
        if (!schedule[selectedClassId]) {
            const newSchedule = { ...schedule };
            newSchedule[selectedClassId] = {};

            // Initialize empty schedule structure
            DAYS_OF_WEEK.forEach((day) => {
                newSchedule[selectedClassId][day] = {};

                for (let hour = 1; hour <= HOURS_IN_DAY; hour++) {
                    newSchedule[selectedClassId][day][hour] = {
                        teacher: "",
                        subject: "",
                    };
                }
            });

            // If annualScheduleTable has data for this class, populate the schedule
            if (annualScheduleTable && annualScheduleTable.length > 0) {
                const classEntries = annualScheduleTable.filter(
                    (entry) => entry.class.id === selectedClassId,
                );

                classEntries.forEach((entry) => {
                    // Convert day number (1-7) to day name from DAYS_OF_WEEK array (0-based index)
                    const dayName = DAYS_OF_WEEK[entry.day - 1];

                    if (dayName && newSchedule[selectedClassId][dayName]) {
                        newSchedule[selectedClassId][dayName][entry.hour] = {
                            teacher: entry.teacher.id,
                            subject: entry.subject.id,
                        };
                    }
                });
            }

            setSchedule(newSchedule);
        }
    }, [selectedClassId, schedule, annualScheduleTable]);

    const getRowId = (day: string, hour: number) => {
        const id =
            annualScheduleTable?.find(
                (entry) =>
                    entry.class.id === selectedClassId &&
                    entry.day === Number(DAYS_OF_WEEK.indexOf(day) + 1) &&
                    entry.hour === hour,
            )?.id || "";
        return id;
    };

    const addNewRow = async (
        type: "teacher" | "subject",
        day: string,
        hour: number,
        value: string,
    ) => {
        if (!school?.id) return;
        const newSchedule = { ...schedule };
        setIsLoading(true);
        setError("");

        try {
            // if there is no cell, create template one
            if (!newSchedule[selectedClassId][day][hour]) {
                newSchedule[selectedClassId][day][hour] = { teacher: "", subject: "" };
            }
            // check if the type selected is already filled
            const isAlreadyFilled = newSchedule[selectedClassId][day][hour][type];

            // fill it and get the IDs
            newSchedule[selectedClassId][day][hour][type] = value;
            setSchedule(newSchedule);
            const teacherId = newSchedule[selectedClassId][day][hour].teacher;
            const subjectId = newSchedule[selectedClassId][day][hour].subject;

            // Find the IDs for the selected class, teacher, and subject
            const selectedClassObj = classes?.find((c) => c.id === selectedClassId);
            const selectedTeacher = teachers?.find((t) => t.id === teacherId);
            const selectedSubject = subjects?.find((s) => s.id === subjectId);

            let response: any;
            if (selectedClassObj && selectedTeacher && selectedSubject) {
                const scheduleRequest: AnnualScheduleRequest = {
                    day: Number(DAYS_OF_WEEK.indexOf(day) + 1), // Convert day name to number (1-7)
                    hour: hour,
                    school: school,
                    class: selectedClassObj,
                    teacher: selectedTeacher,
                    subject: selectedSubject,
                };

                if (isAlreadyFilled) {
                    // need to update the cell
                    // check if the other type select is filled
                    if ((type === "teacher" && subjectId) || (type === "subject" && teacherId)) {
                        // if both already filled -> update the cell function
                        const id = getRowId(day, hour);
                        response = await updateExistingAnnualScheduleItem(id, scheduleRequest);
                    }
                } else {
                    // need to create the cell
                    // check if the other type select is filled
                    if (teacherId && subjectId) {
                        // if both fresh filled -> create new cell function
                        response = await addNewAnnualScheduleItem(scheduleRequest);
                    }
                }
            }
        } catch (err) {
            setError(messages.annualSchedule.createError);
            console.error("Error adding schedule item:", err);
        } finally {
            setIsLoading(false);
        }
    };

    // TODO: not cache the table but fetch it if refresh

    const handleTeacherChange = (day: string, hour: number, value: string) => {
        // addNewRow("teacher", day, hour, value);
    };

    const handleProfessionChange = async (day: string, hour: number, value: string) => {
        // addNewRow("subject", day, hour, value);
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
                            {Array.from({ length: HOURS_IN_DAY }, (_, i) => i + 1).map((hour) => (
                                <tr key={hour}>
                                    <td className={styles.hourCell}>{hour}</td>
                                    {DAYS_OF_WEEK.map((day) => (
                                        <td key={`${day}-${hour}`} className={styles.scheduleCell}>
                                            <div className={styles.cellContent}>
                                                <DynamicInputSelect
                                                    options={createSelectOptions<SubjectType>(
                                                        subjects,
                                                    )}
                                                    placeholder="מקצוע"
                                                    value={
                                                        schedule[selectedClassId]?.[day]?.[hour]
                                                            ?.subject || ""
                                                    }
                                                    onChange={(value: string) =>
                                                        handleProfessionChange(day, hour, value)
                                                    }
                                                    isSearchable
                                                    allowAddNew
                                                />
                                                <DynamicInputSelect
                                                    options={createSelectOptions<TeacherType>(
                                                        teachers,
                                                    )}
                                                    placeholder="מורה"
                                                    value={
                                                        schedule[selectedClassId]?.[day]?.[hour]
                                                            ?.teacher || ""
                                                    }
                                                    onChange={(value: string) =>
                                                        handleTeacherChange(day, hour, value)
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
            {/* <div className={styles.fab}>
                <DynamicInputSelect
                    options={createSelectOptions<ClassType>(classes)}
                    value={selectedClassId}
                    onChange={handleClassChange}
                    placeholder="בחר כיתה..."
                />
            </div> */}
        </div>
    );
};

export default AnnualSchedulePage;
