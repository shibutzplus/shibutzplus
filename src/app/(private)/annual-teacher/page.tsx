"use client";

import React, { useEffect, useRef } from "react";
import { NextPage } from "next";
import styles from "./annualSchedule.module.css";
import AnnualTeacherTable from "@/components/tables/annualByTeacherTable/AnnualTeacherTable/AnnualTeacherTable";
import { useMainContext } from "@/context/MainContext";
import { useAnnualByTeacher } from "@/context/AnnualByTeacherContext";
import { populateAllTeachersSchedule } from "@/services/annual/populate";
import { initializeEmptyAnnualSchedule } from "@/services/annual/initialize";
import { useValidation } from "@/context/ValidationContext";
import { hasIncompleteCells } from "@/utils/scheduleValidation";

const AnnualSchedulePage: NextPage = () => {
    const { classes, teachers, subjects, school } = useMainContext();
    const { selectedTeacherId, schedule, setSchedule, annualScheduleTable, setIsLoading, isSaving, handleScheduleUpdate, } = useAnnualByTeacher();

    // Register validator
    const { registerValidator } = useValidation();

    useEffect(() => {
        const checkSchedule = () => {
            // Return false if incomplete (validation fails)
            return !hasIncompleteCells(schedule);
        };
        const unregister = registerValidator(checkSchedule);
        return unregister;
    }, [registerValidator, schedule]);

    // Initialize and populate schedule for all teachers on first render
    const blockRef = useRef<boolean>(true);
    useEffect(() => {
        if (
            blockRef.current &&
            teachers &&
            teachers.length > 0 &&
            annualScheduleTable &&
            Object.keys(schedule).length === 0
        ) {
            let newSchedule = {};
            // Initialize empty schedule for all teachers
            teachers.forEach((teacher) => {
                newSchedule = initializeEmptyAnnualSchedule(
                    newSchedule,
                    teacher.id,
                    school?.hoursNum || 10,
                );
            });
            // Populate schedule for all teachers in one pass
            newSchedule = populateAllTeachersSchedule(annualScheduleTable, newSchedule);

            setSchedule(newSchedule);
            blockRef.current = false;
        }
    }, [teachers, annualScheduleTable]);

    return (
        <div className={styles.container}>
            {selectedTeacherId ? (
                <AnnualTeacherTable
                    schedule={schedule}
                    selectedTeacherId={selectedTeacherId}
                    subjects={subjects}
                    teachers={teachers}
                    classes={classes}
                    setIsLoading={setIsLoading}
                    isSaving={isSaving}
                    handleScheduleUpdate={handleScheduleUpdate}
                />
            ) : (
                <div className={styles.placeholder}>בחרו מורה כדי להציג את המערכת</div>
            )}
        </div>
    );
};

export default AnnualSchedulePage;
