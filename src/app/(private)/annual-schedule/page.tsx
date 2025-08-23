"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./annualSchedule.module.css";
import { NextPage } from "next";
import { useMainContext } from "@/context/MainContext";
import { TeacherType } from "@/models/types/teachers";
import { SubjectType } from "@/models/types/subjects";
import { WeeklySchedule, AnnualScheduleRequest } from "@/models/types/annualSchedule";
import { dayToNumber } from "@/utils/time";
import messages from "@/resources/messages";
import { errorToast, successToast } from "@/lib/toast";
import {
    getRowId,
    getSelectedElements,
    setNewScheduleTemplate,
} from "@/services/ annualScheduleService";
import { populateAnnualSchedule } from "@/utils/schedule";
import { initializeEmptyAnnualSchedule } from "@/utils/Initialize";
import AnnualTable from "@/components/annualScheduleTable/AnnualTable/AnnualTable";
import { useAnnualTable } from "@/context/AnnualTableContext";

const AnnualSchedulePage: NextPage = () => {
    const {
        classes,
        teachers,
        subjects,
        annualScheduleTable,
        school,
        addNewAnnualScheduleItem,
        updateExistingAnnualScheduleItem,
    } = useMainContext();

    const { selectedClassId, getSelectedClass } = useAnnualTable();

    const [schedule, setSchedule] = useState<WeeklySchedule>({});

    // Initialize and populate schedule for all classes on first render
    const blockRef = useRef<boolean>(true);
    useEffect(() => {
        if (blockRef.current && classes && classes.length > 0 && Object.keys(schedule).length === 0) {
            let newSchedule = {};
            classes.forEach(cls => {
                newSchedule = initializeEmptyAnnualSchedule(newSchedule, cls.id);
                newSchedule = populateAnnualSchedule(annualScheduleTable, cls.id, newSchedule);
            });
            setSchedule(newSchedule);
            blockRef.current = false;
        }
    }, [classes, annualScheduleTable]);

    const addNewRow = async (
        type: "teacher" | "subject",
        elementId: string,
        day: string,
        hour: number,
        isNew?: TeacherType | SubjectType,
    ) => {
        if (!school?.id) return;
        let newSchedule = { ...schedule };

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
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.whiteBox}>
                <AnnualTable
                    schedule={schedule}
                    selectedClassId={selectedClassId}
                    subjects={subjects}
                    teachers={teachers}
                    classes={classes}
                    addNewRow={addNewRow}
                />
            </div>
        </div>
    );
};

export default AnnualSchedulePage;
