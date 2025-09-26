"use client";

import React, { useEffect } from "react";
import styles from "./annualSchedule.module.css";
import { NextPage } from "next";
import { useMainContext } from "@/context/MainContext";
import { populateAnnualSchedule } from "@/utils/schedule";
import { initializeEmptyAnnualSchedule } from "@/utils/Initialize";
import AnnualTable from "@/components/annualScheduleTable/AnnualTable/AnnualTable";
import { useAnnualTable } from "@/context/AnnualTableContext";
import SkeletonAnnualSchedule from "./loading";

// Use TEACHER_BUCKET as a single "virtual class" to aggregate all lessons of the selected teacher
const TEACHER_BUCKET = "__TEACHER__";

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
            newSchedule = initializeEmptyAnnualSchedule(newSchedule, TEACHER_BUCKET);
            classes.forEach((cls) => {
                newSchedule = populateAnnualSchedule(
                    annualScheduleTable,
                    cls.id,
                    newSchedule,
                    selectedTeacherId,
                    TEACHER_BUCKET
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
        selectedClassId === "" && selectedTeacherId ? TEACHER_BUCKET : selectedClassId;

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
