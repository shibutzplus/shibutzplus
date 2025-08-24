"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./annualSchedule.module.css";
import { NextPage } from "next";
import { useMainContext } from "@/context/MainContext";
import { TeacherType } from "@/models/types/teachers";
import { SubjectType } from "@/models/types/subjects";
import { WeeklySchedule, AnnualScheduleRequest } from "@/models/types/annualSchedule";
import { dayToNumber } from "@/utils/time";
import { errorToast } from "@/lib/toast";
import { createPairs, createRequests, setNewScheduleTemplate } from "@/services/ annualScheduleService";
import { populateAnnualSchedule } from "@/utils/schedule";
import { initializeEmptyAnnualSchedule } from "@/utils/Initialize";
import AnnualTable from "@/components/annualScheduleTable/AnnualTable/AnnualTable";
import { useAnnualTable } from "@/context/AnnualTableContext";
import { Pair } from "@/models/types";

const AnnualSchedulePage: NextPage = () => {
    const { classes, teachers, subjects, annualScheduleTable, school } = useMainContext();
    const { selectedClassId, getSelectedClass, addToQueue } = useAnnualTable();

    const [schedule, setSchedule] = useState<WeeklySchedule>({});

    // Initialize and populate schedule for all classes on first render
    const blockRef = useRef<boolean>(true);
    useEffect(() => {
        if (
            blockRef.current &&
            classes &&
            classes.length > 0 &&
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

    const addNewRow = async (
        type: "teachers" | "subjects",
        elementIds: string[],
        day: string,
        hour: number,
    ) => {
        if (!school?.id) return;
        let newSchedule = { ...schedule };
        newSchedule = setNewScheduleTemplate(newSchedule, selectedClassId, day, hour);

        // If not already filled, fill it and get the IDs
        newSchedule[selectedClassId][day][hour][type] = elementIds;
        const teacherIds = schedule[selectedClassId][day][hour].teachers;
        const subjectIds = schedule[selectedClassId][day][hour].subjects;
        setSchedule(newSchedule);

        // You need both elements for creating new records
        if (subjectIds.length === 0 || teacherIds.length === 0) return;
        if (subjectIds.length > teacherIds.length) {
            errorToast("מספר המקצועות לא יעלה על מספר המורים");
            return;
        }
        const pairs: Pair[] = createPairs(teacherIds, subjectIds);
        const selectedClassObj = getSelectedClass();
        const requests: AnnualScheduleRequest[] = createRequests(
            selectedClassObj,
            school,
            teachers,
            subjects,
            pairs,
            day,
            hour,
        );
        addToQueue(requests);
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
