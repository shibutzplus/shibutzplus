"use client";

import React, { useEffect, useRef } from "react";
import { NextPage } from "next";
import styles from "./annualAltBuild.module.css";
import AnnualAltBuildTable from "@/components/tables/annualAltBuildTable/annualAltBuildTable/AnnualAltBuildTable";
import { useMainContext } from "@/context/MainContext";
import { useAnnualAltByDay } from "@/context/AnnualAltByDayContext";
import { populateAllClassesSchedule } from "@/services/annual/populate";
import { initializeEmptyAnnualSchedule } from "@/services/annual/initialize";

const AltSchedulePage: NextPage = () => {
    const { classes, teachers, subjects, school } = useMainContext();
    const {
        altScheduleTable,
        selectedDay,
        schedule,
        setSchedule,
        isLoading,
        setIsLoading,
        setIsSaving,
        isSaving,
        handleScheduleUpdate,
    } = useAnnualAltByDay();

    // Initialize and populate schedule for all classes on first render
    const blockRef = useRef<boolean>(true);
    useEffect(() => {
        if (
            blockRef.current &&
            classes &&
            classes.length > 0 &&
            altScheduleTable &&
            Object.keys(schedule).length === 0
        ) {
            let newSchedule = {};
            classes.forEach((c) => {
                newSchedule = initializeEmptyAnnualSchedule(
                    newSchedule,
                    c.id,
                    school?.fromHour ?? 1,
                    school?.toHour ?? 10,
                );
            });
            newSchedule = populateAllClassesSchedule(altScheduleTable, newSchedule);
            setSchedule(newSchedule);
            blockRef.current = false;
        }
    }, [classes, altScheduleTable]);

    return (
        <div className={styles.container}>
            {classes && classes.length > 0 ? (
                <AnnualAltBuildTable
                    schedule={schedule}
                    selectedDay={selectedDay}
                    subjects={subjects}
                    teachers={teachers}
                    classes={classes}
                    isDisabled={isLoading || isSaving}
                    handleScheduleUpdate={handleScheduleUpdate}
                />
            ) : (
                <div className={styles.emptyState}>אין כיתות להצגה</div>
            )}
        </div>
    );
};

export default AltSchedulePage;
