"use client";

import React, { useEffect } from "react";
import { WeeklySchedule } from "@/models/types/annualSchedule";
import { SubjectType } from "@/models/types/subjects";
import { TeacherType } from "@/models/types/teachers";
import { ClassType } from "@/models/types/classes";
import { TableRows } from "@/models/constant/table";
import { DAYS_OF_WORK_WEEK, HOURS_IN_DAY } from "@/utils/time"; // Added import
import AnnualViewRow from "@/components/tables/annualViewTable/AnnualViewRow/AnnualViewRow";
import styles from "./AnnualViewTable.module.css";
import { useMainContext } from "@/context/MainContext";

type AnnualViewTableProps = {
    schedule: WeeklySchedule;
    selectedClassId: string;
    selectedTeacherId: string;
    subjects: SubjectType[] | undefined;
    teachers: TeacherType[] | undefined;
    classes: ClassType[] | undefined;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

const AnnualViewTable: React.FC<AnnualViewTableProps> = ({
    schedule,
    selectedClassId,
    selectedTeacherId,
    subjects,
    teachers,
    classes,
    setIsLoading,
}) => {
    const { settings } = useMainContext();
    const hoursNum = settings?.hoursNum || HOURS_IN_DAY;

    const isDisabled = !schedule || !subjects || !classes;

    useEffect(() => {
        setIsLoading(!schedule || !subjects || !classes);
    }, [!!schedule, !!subjects, !!classes]);

    return (
        <div className={styles.tableContainer}>
            <table className={styles.scheduleTable}>
                <thead>
                    <tr>
                        <th className={`${styles.headerCell} ${styles.hoursColumn}`}>
                            <div className={`${styles.headerInner} ${styles.hoursHeader}`}></div>
                        </th>
                        <th className={styles.emptyColSeparator}></th>
                        {DAYS_OF_WORK_WEEK.map((day) => (
                            <th key={day} className={styles.headerCell}>
                                <div className={styles.headerInner}>
                                    {`יום ${day}'`}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className={styles.scheduleTableBody}>
                    {Array.from({ length: hoursNum }, (_, i) => i + 1).map((hour) => (
                        <AnnualViewRow
                            key={hour}
                            hour={hour}
                            isDisabled={isDisabled}
                            schedule={schedule}
                            selectedClassId={selectedClassId}
                            selectedTeacherId={selectedTeacherId}
                            subjects={subjects || []}
                            teachers={teachers || []}
                            classes={classes || []}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AnnualViewTable;
