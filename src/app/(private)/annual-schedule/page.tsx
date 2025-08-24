"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./annualSchedule.module.css";
import { NextPage } from "next";
import { useMainContext } from "@/context/MainContext";
import { TeacherType } from "@/models/types/teachers";
import { SubjectType } from "@/models/types/subjects";
import {
    WeeklySchedule,
    AnnualScheduleRequest,
    AnnualScheduleCell,
} from "@/models/types/annualSchedule";
import { dayToNumber } from "@/utils/time";
import messages from "@/resources/messages";
import { errorToast } from "@/lib/toast";
import {
    getRowIds,
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
        deleteAnnualScheduleItem,
    } = useMainContext();

    const { selectedClassId, getSelectedClass } = useAnnualTable();

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

    const matchPairs = (teacherIds: string[], subjectIds: string[]): Pair[] => {
        // You need both elements for creating new records
        if (subjectIds.length === 0 || teacherIds.length === 0) return [];
        if (subjectIds.length > teacherIds.length) {
            errorToast("מספר המקצועות לא יעלה על מספר המורים");
            // TODO: need to remove the problemtic subject from the select
            return [];
        }
        const res: Pair[] = [];
        const lastTwoIdx = subjectIds.length - 1;
        for (let i = 0; i < teacherIds.length; i++) {
            const j = i < subjectIds.length ? i : lastTwoIdx;
            res.push([teacherIds[i], subjectIds[j]]);
        }
        return res;
    };

    const keyOf = ([t, s]: Pair) => `${t}__${s}`;

    type Pair = [string, string];

    type UpdateAction = { pair: Pair; addTeacher: boolean; addSubject: boolean };

    type PlanResult = {
        pairs: Pair[];
        leaveAlone: Pair[];
        updates: UpdateAction[]; // addTeacher/addSubject flags show what's missing
        creates: Pair[]; // neither existed in the cell
    };

    /**
     * Build a plan for how to apply teacherIds ("one") and subjectIds ("two")
     * into the schedule at a specific day & hour.
     *
     * Rules for pairing (same as your spec):
     * - If either array is empty → no pairs.
     * - If `two` is longer than `one` → throws.
     * - If lengths are equal → 1:1.
     * - If `one` is longer → 1:1 until `two` ends; remainder of `one` pair to the last of `two`.
     *
     * Row decisions for each pair (teacherId, subjectId):
     * - LEAVE: if a row exists where both are already present in that cell.
     * - UPDATE: if a row exists with exactly one of them → add the missing one.
     * - CREATE: if no row has either teacher or subject at that time.
     */
    function planScheduleEdits(
        schedule: WeeklySchedule,
        className: string,
        day: string,
        hour: string,
        teacherIds: string[],
        subjectIds: string[],
    ): PlanResult {
        const pairs = matchPairs(teacherIds, subjectIds);
        if (pairs.length === 0) return { pairs, leaveAlone: [], updates: [], creates: [] };

        const cell = schedule[className]?.[day]?.[hour];
        const teachers = cell?.teachers ?? [];
        const subjects = cell?.subjects ?? [];

        // Pairs that ALREADY exist as rows (according to the same pairing rule)
        const existingPairs = new Set<string>(matchPairs(teachers, subjects).map(keyOf));

        // Presence sets from ORIGINAL cell state (no mutation while deciding)
        const hasTeacher = new Set(teachers);
        const hasSubject = new Set(subjects);

        const leaveAlone: Pair[] = [];
        const updates: UpdateAction[] = [];
        const creates: Pair[] = [];

        for (const p of pairs) {
            const [tId, sId] = p;

            // Already an existing row? leave it.
            if (existingPairs.has(keyOf(p))) {
                leaveAlone.push(p);
                continue;
            }

            const tPresent = hasTeacher.has(tId);
            const sPresent = hasSubject.has(sId);

            // ✅ CHANGED: both present but not paired yet => create a new row
            if (tPresent && sPresent) {
                creates.push(p);
                continue;
            }

            // Exactly one side present => update that row by adding the missing side
            if (tPresent && !sPresent) {
                updates.push({ pair: p, addTeacher: false, addSubject: true });
                continue;
            }
            if (!tPresent && sPresent) {
                updates.push({ pair: p, addTeacher: true, addSubject: false });
                continue;
            }

            // Neither present => create
            creates.push(p);
        }

        return { pairs, leaveAlone, updates, creates };
    }

    const addNewRow = async (
        type: "teachers" | "subjects",
        elementIds: string[],
        day: string,
        hour: number,
        isNew?: TeacherType | SubjectType,
    ) => {
        if (!school?.id) return;
        let newSchedule = { ...schedule };

        try {
            newSchedule = setNewScheduleTemplate(newSchedule, selectedClassId, day, hour);

            // If not already filled, fill it and get the IDs
            newSchedule[selectedClassId][day][hour][type] = elementIds;
            const teacherIds = schedule[selectedClassId][day][hour].teachers;
            const subjectIds = schedule[selectedClassId][day][hour].subjects;
            setSchedule(newSchedule);
            const res = planScheduleEdits(
                newSchedule,
                selectedClassId,
                day,
                hour.toString(),
                teacherIds,
                subjectIds,
            );
            console.log(res);
            // const selectedClassObj = getSelectedClass();

            // // loop on the matchs teacher<>subject
            // for (const [teacherId, subjectId] of res) {
            //     const { selectedTeacher, selectedSubject } = getSelectedElements(
            //         teacherId,
            //         subjectId,
            //         type,
            //         isNew,
            //         subjects,
            //         teachers,
            //     );
            //     if (selectedClassObj && selectedTeacher && selectedSubject) {
            //         const scheduleRequest: AnnualScheduleRequest = {
            //             day: dayToNumber(day),
            //             hour: hour,
            //             school: school,
            //             class: selectedClassObj,
            //             teacher: selectedTeacher,
            //             subject: selectedSubject,
            //         };

            //         // check if the match is already exsists
            //         const id = getRowIds(
            //             annualScheduleTable,
            //             "teachers",
            //             selectedClassId,
            //             selectedTeacher.id,
            //             day,
            //             hour,
            //         )[0];
            //     }
            // }

            // const teacherMaxIndex = teacherIds.length - 1;
            // const subjectMaxIndex = subjectIds.length - 1;

            // const teacherId = teacherIds[teacherMaxIndex];
            // const subjectId = subjectIds[subjectMaxIndex];

            // const { selectedTeacher, selectedSubject } = getSelectedElements(
            //     teacherId,
            //     subjectId,
            //     type,
            //     isNew,
            //     subjects,
            //     teachers,
            // );

            // // const selectedClassObj = getSelectedClass();

            // if (selectedClassObj && selectedTeacher && selectedSubject) {
            //     const scheduleRequest: AnnualScheduleRequest = {
            //         day: dayToNumber(day),
            //         hour: hour,
            //         school: school,
            //         class: selectedClassObj,
            //         teacher: selectedTeacher,
            //         subject: selectedSubject,
            //     };

            //     let response: any;
            //     if (teacherId && subjectId) {
            //         if (
            //             (teacherMaxIndex === 0 && subjectMaxIndex === 0) ||
            //             teacherMaxIndex > subjectMaxIndex
            //         ) {
            //             //Create element
            //             response = await addNewAnnualScheduleItem(scheduleRequest);
            //         } else if (teacherMaxIndex === subjectMaxIndex) {
            //             //Update element
            //             const id = getRowIds(
            //                 annualScheduleTable,
            //                 "teachers",
            //                 selectedClassId,
            //                 selectedTeacher.id,
            //                 day,
            //                 hour,
            //             )[0];
            //             response = await updateExistingAnnualScheduleItem(id, scheduleRequest);
            //         }
            //     }
            //     if (!response) {
            //         errorToast(messages.annualSchedule.createError);
            //     }
            // }
        } catch (err) {
            errorToast(messages.annualSchedule.createError);
            console.error("Error adding schedule item:", err);
        }
    };

    // let response: any;
    // if (subjectIds.length === 1 && teacherIds.length === 1) {
    //     //Create element of last index of subjectIds and teacherIds (s1<>t1)
    //     response = await addNewAnnualScheduleItem(scheduleRequest);
    // }

    // if (subjectIds.length < teacherIds.length) {
    //     //Create element from the last index of subjectIds and teacherIds (s1<>t2)(s1<>t3)
    //     response = await addNewAnnualScheduleItem(scheduleRequest);
    // }

    // if t 1 - s 1 -- match 1 to 1
    // if t 2 - s 2 -- match 1 to 1
    //// if(subjectIds.length === teacherIds.length) -> create or update

    // if t 2 - s 1 -- ?

    // if t 3 - s 1 -- ?
    // s-1=0 -> t-0=2 -> 2 match to s

    // if t 3 - s 2
    // s-1=1 -> t-1=2 -> 2t match last s

    // if I have 1 subjects and 3 teachers, the calc is, the amount of subjects (1) reduce 1 (result 0)
    // the result reduce the number of teahcers (3-0) the result (3) is the amount of teachers to match
    // the last subjects (subject number 1)

    // if I have 2 subjects and 3 teachers, the calc is, the amount of subjects (2) reduce 1 (result 1)
    // the result reduce the number of teahcers (3-1) the result (2) is the amount of teachers to match
    // the last subjects (subject number 2)

    // if t 1 - s 0 -- nothing
    // if t 2 - s 0 -- nothing
    //// if(subjectIds.length === 0) -> return

    // if t 0 - s 1 -- x
    //// if(subjectIds.length > teacherIds.length) -> return + alert

    // if(subjectMaxIndex === 0 && teacherMaxIndex > 0){ // patch for start
    //     errorToast("בחירת מורים נוספים תתאפשר רק לאחר בחירת מקצוע אחד לפחות")
    //     return;
    // }

    const removeRow = async (
        type: "teachers" | "subjects",
        elementIds: string[],
        removedValue: string,
        day: string,
        hour: number,
    ) => {
        if (!school?.id) return;
        let newSchedule = { ...schedule };
        try {
            newSchedule = setNewScheduleTemplate(newSchedule, selectedClassId, day, hour);

            // If not already filled, fill it and get the IDs
            newSchedule[selectedClassId][day][hour][type] = elementIds;
            setSchedule(newSchedule);
            const id = getRowIds(
                annualScheduleTable,
                type,
                selectedClassId,
                removedValue,
                day,
                hour,
            );
            for (const i of id) {
                const response = await deleteAnnualScheduleItem(i);
                if (!response) {
                    errorToast(messages.teachers.deleteError);
                }
            }
        } catch (err) {
            errorToast(messages.teachers.deleteError);
            console.error("Error removing schedule item:", err);
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
                    removeRow={removeRow}
                />
            </div>
        </div>
    );
};

export default AnnualSchedulePage;
