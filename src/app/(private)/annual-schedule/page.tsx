"use client";

import React, { useEffect, useRef } from "react";
import { NextPage } from "next";
import styles from "./annualSchedule.module.css";
import AnnualTable from "@/components/tables/annualScheduleTable/AnnualTable/AnnualTable";
import { useMainContext } from "@/context/MainContext";
import { useAnnualTable } from "@/context/AnnualTableContext";
import { populateAnnualSchedule } from "@/utils/schedule";
import { initializeEmptyAnnualSchedule } from "@/utils/Initialize";
import AnnualSkeleton from "@/components/loading/skeleton/AnnualSkeleton/AnnualSkeleton";

const AnnualSchedulePage: NextPage = () => {
    const { classes, teachers, subjects } = useMainContext();
    const { annualScheduleTable, selectedClassId, schedule, setSchedule } = useAnnualTable();

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
            classes.forEach((cls) => {
                newSchedule = initializeEmptyAnnualSchedule(newSchedule, cls.id);
                newSchedule = populateAnnualSchedule(annualScheduleTable, cls.id, newSchedule);
            });
            setSchedule(newSchedule);
            blockRef.current = false;
        }
    }, [classes, annualScheduleTable]);

    return (
        <div className={styles.container}>
            <AnnualTable
                schedule={schedule}
                selectedClassId={selectedClassId}
                subjects={subjects}
                teachers={teachers}
                classes={classes}
            />
        </div>
    );
};

export default AnnualSchedulePage;
