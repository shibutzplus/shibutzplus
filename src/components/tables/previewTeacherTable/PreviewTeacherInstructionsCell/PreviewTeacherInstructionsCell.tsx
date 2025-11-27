import React from "react";
import styles from "./PreviewTeacherInstructionsCell.module.css";
import { TeacherScheduleType } from "@/models/types/portalSchedule";

type PreviewTeacherInstructionsCellProps = {
    row: TeacherScheduleType | undefined;
};

const PreviewTeacherInstructionsCell: React.FC<PreviewTeacherInstructionsCellProps> = ({ row }) => {
    return (
        <div className={`${row ? styles.cellContent : styles.emptyCell}`}>{row?.instructions}</div>
    );
};
export default PreviewTeacherInstructionsCell;
