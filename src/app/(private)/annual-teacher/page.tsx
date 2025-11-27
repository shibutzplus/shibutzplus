"use client";

import React, { useEffect, useRef } from "react";
import { NextPage } from "next";
import styles from "./annualSchedule.module.css";
import AnnualTeacherTable from "@/components/tables/annualByTeacherTable/AnnualTeacherTable/AnnualTeacherTable";
import { useMainContext } from "@/context/MainContext";
import { useAnnualByTeacher } from "@/context/AnnualByTeacherContext";
import { populateAnnualScheduleForTeacher } from "@/services/annual/populate";
import { initializeEmptyAnnualSchedule } from "@/services/annual/initialize";

const AnnualSchedulePage: NextPage = () => {
    const { classes, teachers, subjects } = useMainContext();
    const {
        selectedTeacherId,
        schedule,
        setSchedule,
        annualScheduleTable,
        setIsLoading,
        setIsSaving,
        isSaving,
        handleAddNewRow,
    } = useAnnualByTeacher();

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
            teachers.forEach((teacher) => {
                newSchedule = initializeEmptyAnnualSchedule(newSchedule, teacher.id);
                newSchedule = populateAnnualScheduleForTeacher(
                    annualScheduleTable,
                    teacher.id,
                    newSchedule,
                );
            });
            setSchedule(newSchedule);
            blockRef.current = false;
        }
    }, [teachers, annualScheduleTable]);

    return (
        <div className={styles.container}>
            {selectedTeacherId ? (
                <AnnualTeacherTable
                    schedule={schedule}
                    selectedClassId={selectedTeacherId}
                    subjects={subjects}
                    teachers={teachers}
                    classes={classes}
                    setIsLoading={setIsLoading}
                    setIsSaving={setIsSaving}
                    isSaving={isSaving}
                    handleAddNewRow={handleAddNewRow}
                />
            ) : (
                <div className={styles.placeholder}>בחרו מורה כדי להציג את המערכת</div>
            )}
        </div>
    );
};

export default AnnualSchedulePage;
