"use client";

import React, { useState, useEffect } from "react";
import styles from "./annualSchedule.module.css";
import { NextPage } from "next";
import SubmitBtn from "@/components/ui/SubmitBtn/SubmitBtn";
import { useMainContext } from "@/context/MainContext";
import DynamicInputSelect from "@/components/ui/InputSelect/DynamicInputSelect";
import { createSelectOptions } from "@/utils/format";
import { ClassType } from "@/models/types/classes";
import { TeacherType } from "@/models/types/teachers";
import { SubjectType } from "@/models/types/subjects";
import { WeeklySchedule, AnnualScheduleRequest } from "@/models/types/annualSchedule";
import { DAYS_OF_WEEK, HOURS_IN_DAY } from "@/utils/time";
import { addAnnualScheduleAction } from "@/app/actions/addAnnualScheduleAction";
import messages from "@/resources/messages";
import { updateAnnualScheduleAction } from "@/app/actions/updateAnnualScheduleAction";

const AnnualSchedulePage: NextPage = () => {
    const { classes, teachers, subjects, annualScheduleTable, school, updateAnnualSchedule } =
        useMainContext();

    const [selectedClassId, setSelectedClassId] = useState<string>(classes?.[0]?.id || "");
    const [showTable, setShowTable] = useState<boolean>(true);
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

    const handleClassChange = (value: string) => {
        setSelectedClassId(value);
        setShowTable(true);
    };

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
            const isFilled = newSchedule[selectedClassId][day][hour][type];

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

                if (isFilled) {
                    // need to update the cell
                    // check if the other type select is filled
                    if ((type === "teacher" && subjectId) || (type === "subject" && teacherId)) {
                        // if both already filled -> update the cell function
                        const id = getRowId(day, hour);
                        response = await updateAnnualScheduleAction(id, scheduleRequest);
                    }
                } else {
                    // need to create the cell
                    // check if the other type select is filled
                    if (teacherId && subjectId) {
                        // if both fresh filled -> create new cell function
                        response = await addAnnualScheduleAction(scheduleRequest);
                    }
                }
                if (response.success && response.data) {
                    updateAnnualSchedule(response.data);
                } else {
                    setError(response.message);
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
        addNewRow("teacher", day, hour, value);
    };

    const handleProfessionChange = async (day: string, hour: number, value: string) => {
        addNewRow("subject", day, hour, value);
    };

    return (
        <div className={styles.container}>
            <div className={styles.whiteBox}>
                {error && <div className={styles.errorMessage}>{error}</div>}
                <section className={styles.classSelectorSection}>
                    <div className={styles.classSelectorRight}>
                        <h3>בחרו כיתה: </h3>

                        <div className={styles.classSelector}>
                            <DynamicInputSelect
                                options={createSelectOptions<ClassType>(classes)}
                                value={selectedClassId}
                                onChange={handleClassChange}
                                placeholder="בחר כיתה..."
                            />
                        </div>
                        {isLoading ? <div>שמירת נתונים מתבצעת...</div> : null}
                    </div>
                    <div className={styles.publishButtonContainer}>
                        <SubmitBtn
                            type={"button"}
                            isLoading={false}
                            loadingText={""}
                            buttonText={"פרסם גרסה סופית"}
                        />
                    </div>
                </section>

                {showTable && (
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
                                {Array.from({ length: HOURS_IN_DAY }, (_, i) => i + 1).map(
                                    (hour) => (
                                        <tr key={hour}>
                                            <td className={styles.hourCell}>{hour}</td>
                                            {DAYS_OF_WEEK.map((day) => (
                                                <td
                                                    key={`${day}-${hour}`}
                                                    className={styles.scheduleCell}
                                                >
                                                    <div className={styles.cellContent}>
                                                        <DynamicInputSelect
                                                            options={createSelectOptions<TeacherType>(
                                                                teachers,
                                                            )}
                                                            placeholder="מורה"
                                                            value={
                                                                schedule[selectedClassId]?.[day]?.[
                                                                    hour
                                                                ]?.teacher || ""
                                                            }
                                                            onChange={(value: string) =>
                                                                handleTeacherChange(
                                                                    day,
                                                                    hour,
                                                                    value,
                                                                )
                                                            }
                                                            isSearchable
                                                            allowAddNew
                                                        />
                                                        <DynamicInputSelect
                                                            options={createSelectOptions<SubjectType>(
                                                                subjects,
                                                            )}
                                                            placeholder="מקצוע"
                                                            value={
                                                                schedule[selectedClassId]?.[day]?.[
                                                                    hour
                                                                ]?.subject || ""
                                                            }
                                                            onChange={(value: string) =>
                                                                handleProfessionChange(
                                                                    day,
                                                                    hour,
                                                                    value,
                                                                )
                                                            }
                                                            isSearchable
                                                            allowAddNew
                                                        />
                                                    </div>
                                                </td>
                                            ))}
                                        </tr>
                                    ),
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnnualSchedulePage;
