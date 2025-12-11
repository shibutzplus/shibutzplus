"use client";

import React, { useEffect } from "react";
import { WeeklySchedule } from "@/models/types/annualSchedule";
import { SubjectType } from "@/models/types/subjects";
import { TeacherType } from "@/models/types/teachers";
import { ClassType } from "@/models/types/classes";
import { TableRows } from "@/models/constant/table";
import { DAYS_OF_WORK_WEEK } from "@/utils/time";
import AnnualRow from "../AnnualRow/AnnualRow";
import styles from "./AnnualTeacherTable.module.css";
import { AnnualInputCellType } from "@/models/types/annualSchedule";
import { SelectMethod } from "@/models/types/actions";

type AnnualTeacherTableProps = {
    schedule: WeeklySchedule;
    selectedClassId: string;
    subjects: SubjectType[] | undefined;
    teachers: TeacherType[] | undefined;
    classes: ClassType[] | undefined;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    isSaving: boolean;
    handleAddNewRow: (
        type: AnnualInputCellType,
        elementIds: string[],
        day: string,
        hour: number,
        method: SelectMethod,
        newElementObj?: TeacherType | SubjectType,
    ) => Promise<void>;
};

const AnnualTeacherTable: React.FC<AnnualTeacherTableProps> = ({
    schedule,
    selectedClassId,
    subjects,
    teachers,
    classes,
    setIsLoading,
    isSaving,
    handleAddNewRow,
}) => {
    const isDisabled = isSaving || !schedule || !subjects || !classes;

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
                    {Array.from({ length: TableRows }, (_, i) => i + 1).map((hour) => (
                        <AnnualRow
                            key={hour}
                            hour={hour}
                            isDisabled={isDisabled}
                            schedule={schedule}
                            selectedClassId={selectedClassId}
                            subjects={subjects || []}
                            teachers={teachers || []}
                            classes={classes || []}
                            handleAddNewRow={handleAddNewRow}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AnnualTeacherTable;
