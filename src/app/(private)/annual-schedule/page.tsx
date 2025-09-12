"use client";

import React, { useEffect, useRef } from "react";
import styles from "./annualSchedule.module.css";
import { NextPage } from "next";
import { useMainContext } from "@/context/MainContext";
import { populateAnnualSchedule } from "@/utils/schedule";
import { initializeEmptyAnnualSchedule } from "@/utils/Initialize";
import AnnualTable from "@/components/annualScheduleTable/AnnualTable/AnnualTable";
import { useAnnualTable } from "@/context/AnnualTableContext";
import SkeletonAnnualSchedule from "./loading";

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

    if (!schedule || !selectedClassId || !subjects || !classes ? true : false)
        return <SkeletonAnnualSchedule />;

    return (
        <div className={styles.container}>
            <div className={styles.whiteBox}>
                <AnnualTable
                    schedule={schedule}
                    selectedClassId={selectedClassId}
                    subjects={subjects}
                    teachers={teachers}
                    classes={classes}
                />
            </div>
        </div>
    );
};

export default AnnualSchedulePage;
