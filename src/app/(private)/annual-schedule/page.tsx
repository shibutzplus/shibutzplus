"use client";

import React, { useEffect } from "react";
import { NextPage } from "next";
import styles from "./annualSchedule.module.css";
import AnnualTable from "@/components/tables/annualScheduleTable/AnnualTable/AnnualTable";
import SkeletonAnnualSchedule from "./loading";
import { useMainContext } from "@/context/MainContext";
import { useAnnualTable } from "@/context/AnnualTableContext";
import { populateAnnualSchedule } from "@/utils/schedule";
import { initializeEmptyAnnualSchedule } from "@/utils/Initialize";

// Use TEACHER_SCHEDULE as a single "virtual class" to aggregate all lessons of the selected teacher
const TEACHER_SCHEDULE = "__TEACHER__";

const AnnualSchedulePage: NextPage = () => {
    const { classes, teachers, subjects } = useMainContext();
    const { annualScheduleTable, selectedClassId, selectedTeacherId, schedule, setSchedule } = useAnnualTable();

    useEffect(() => {
        // Recompute schedule only for the valid states
        if (!classes || classes.length === 0 || !annualScheduleTable) return;

        let newSchedule: any = {};

        // Case 1: class selected (with or without teacher) → show class schedule
        if (selectedClassId && selectedClassId !== "") {
            newSchedule = initializeEmptyAnnualSchedule(newSchedule, selectedClassId);
            newSchedule = populateAnnualSchedule(annualScheduleTable, selectedClassId, newSchedule);
        }

        // Case 2: no class + teacher selected → aggregate teacher schedule into a single bucket
        else if (selectedTeacherId) {
            newSchedule = initializeEmptyAnnualSchedule(newSchedule, TEACHER_SCHEDULE);
            classes.forEach((cls) => {
                newSchedule = populateAnnualSchedule(
                    annualScheduleTable,
                    cls.id,
                    newSchedule,
                    selectedTeacherId,
                    TEACHER_SCHEDULE
                );
            });
        }

        // Case 3: no class + no teacher → UI will show message
        else {
            newSchedule = {};
        }

        setSchedule(newSchedule);
    }, [classes, annualScheduleTable, selectedClassId, selectedTeacherId, setSchedule]);

    if (!schedule || selectedClassId === undefined || !subjects || !classes) {
        return <SkeletonAnnualSchedule />;
    }

    // Effective id for rendering: when teacher mode, render the single bucket
    const effectiveSelectedId =
        selectedClassId === "" && selectedTeacherId ? TEACHER_SCHEDULE : selectedClassId;

    return (
        <div className={styles.container}>
            <div className={styles.whiteBox}>
                <AnnualTable
                    schedule={schedule}
                    selectedClassId={effectiveSelectedId}
                    subjects={subjects}
                    teachers={teachers}
                    classes={classes}
                />
            </div>
        </div>
    );
};

export default AnnualSchedulePage;
