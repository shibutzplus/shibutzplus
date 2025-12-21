import React, { useMemo } from "react";
import styles from "./PreviewTeacherCell.module.css";
import { ColumnType, ColumnTypeValues, DailyScheduleCell } from "@/models/types/dailySchedule";
import EmptyCell from "@/components/ui/table/EmptyCell/EmptyCell";
import { AppType } from "@/models/types";

type PreviewTeacherCellProps = {
    columnId: string;
    cell: DailyScheduleCell;
    type: ColumnType;
    appType?: AppType;
};

const PreviewTeacherCell: React.FC<PreviewTeacherCellProps> = ({ cell, appType }) => {
    const classesData = cell?.classes;
    const subjectData = cell?.subject;
    const subTeacherData = cell?.subTeacher;
    const teacherText = cell?.event;
    const isMissingTeacher = cell?.headerCol?.type === ColumnTypeValues.missingTeacher;
    const isActivity = useMemo(() => classesData?.some((cls) => cls.activity), [classesData]);

    const getTextContent = () => {
        if (!classesData?.length) return "";
        const classNames = classesData.map((cls) => cls.name).join(", ");
        return classNames + (!isActivity && subjectData ? " | " + subjectData.name : "");
    };

    if (appType === "public" && isActivity) {
        return (
            <div className={styles.cellContent}>
                <EmptyCell />
            </div>
        );
    }

    // If there is no sub teacher and no event, and there is also no class/subject to show
    // return an empty cell.
    if (
        !subTeacherData &&
        !teacherText &&
        (!isMissingTeacher || (!classesData?.length && !subjectData))
    ) {
        return (
            <div className={styles.cellContent}>
                <EmptyCell />
            </div>
        );
    }

    return (
        <div className={styles.cellContent}>
            <div className={styles.innerCellContent}>
                <span className={isActivity ? styles.activityText : ""}>
                    {getTextContent()}
                </span>
                {subTeacherData ? (
                    <div className={styles.subTeacherName}>{subTeacherData.name}</div>
                ) : teacherText ? (
                    <div className={styles.subTeacherName}>{teacherText}</div>
                ) : isMissingTeacher && !isActivity ? (
                    <div className={styles.missingSubTeacherName}>אין מילוי מקום</div>
                ) : null}
            </div>
        </div>
    );
};

export default PreviewTeacherCell;
