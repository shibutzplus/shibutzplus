"use client";

import React, { useEffect, useRef } from "react";
import { NextPage } from "next";
import styles from "./annualSchedule.module.css";
import AnnualClassTable from "@/components/tables/annualByClassTable/AnnualClassTable/AnnualClassTable";
import { useMainContext } from "@/context/MainContext";
import { useAnnualByClass } from "@/context/AnnualByClassContext";
import { populateAllClassesSchedule } from "@/services/annual/populate";
import { initializeEmptyAnnualSchedule } from "@/services/annual/initialize";

const AnnualSchedulePage: NextPage = () => {
    const { classes, teachers, subjects } = useMainContext();
    const { annualScheduleTable, selectedClassId, schedule, setSchedule, setIsLoading, setIsSaving, isSaving, handleAddNewRow, } = useAnnualByClass();

    // Initialize and populate schedule for all classes on first render
    const blockRef = useRef<boolean>(true);
    useEffect(() => {
        if (
            blockRef.current &&
            classes &&
            classes.length > 0 &&
            annualScheduleTable &&
            Object.keys(schedule).length === 0
        ) {
            let newSchedule = {};
            // Initialize empty schedule for all classes
            classes.forEach((cls) => {
                newSchedule = initializeEmptyAnnualSchedule(newSchedule, cls.id);
            });
            // Populate schedule for all classes in one pass
            newSchedule = populateAllClassesSchedule(annualScheduleTable, newSchedule);

            setSchedule(newSchedule);
            blockRef.current = false;
        }
    }, [classes, annualScheduleTable]);

    return (
        <div className={styles.container}>
            {selectedClassId ? (
                <AnnualClassTable
                    schedule={schedule}
                    selectedClassId={selectedClassId}
                    subjects={subjects}
                    teachers={teachers}
                    classes={classes}
                    setIsLoading={setIsLoading}
                    setIsSaving={setIsSaving}
                    isSaving={isSaving}
                    handleAddNewRow={handleAddNewRow}
                />
            ) : (
                <div className={styles.placeholder}>בחרו כיתה כדי להציג את המערכת</div>
            )}
        </div>
    );
};

export default AnnualSchedulePage;
