"use client";

import React, { useEffect } from "react";
import { WeeklySchedule } from "@/models/types/annualSchedule";
import { SubjectType } from "@/models/types/subjects";
import { TeacherType } from "@/models/types/teachers";
import { ClassType } from "@/models/types/classes";
import { TableRows } from "@/models/constant/table";
import AnnualHeader from "@/components/tables/annualByClassTable/AnnualHeader/AnnualHeader";
import AnnualViewRow from "@/components/tables/annualViewTable/AnnualViewRow/AnnualViewRow";
import styles from "./AnnualViewTable.module.css";

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
    const isDisabled = !schedule || !subjects || !classes;

    useEffect(() => {
        setIsLoading(!schedule || !subjects || !classes);
    }, [!!schedule, !!subjects, !!classes]);

    return (
        <div className={styles.tableContainer}>
            <table className={styles.scheduleTable}>
                <AnnualHeader />
                <tbody className={styles.scheduleTableBody}>
                    {Array.from({ length: TableRows }, (_, i) => i + 1).map((hour) => (
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
