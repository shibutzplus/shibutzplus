"use client";

import React from "react";
import styles from "./TeacherMaterial.module.css";
import PortalTable from "@/components/teacherPortalTable/PortalTable/PortalTable";
import { PortalProvider } from "@/context/PortalContext";

type InnerProps = {
    onClose: () => void;
    teacherName: string;
};

const InnerContent: React.FC<InnerProps> = ({ onClose, teacherName }) => {
    return (
        <div className={styles.modal}>
            <button className={styles.closeBtn} onClick={onClose}>✕</button>
            <h2 className={styles.title}>{teacherName}</h2>
            <div className={styles.tableArea}>
                <PortalTable embedded />
            </div>
        </div>
    );
};

type Props = {
    isOpen: boolean;
    onClose: () => void;
    teacherName: string;
    date: string;
    teacherId?: string;
    schoolId?: string;
};

const TeacherMaterial: React.FC<Props> = ({
    isOpen,
    onClose,
    teacherName,
    date,
    teacherId,
    schoolId,
}) => {
    if (!isOpen) return null;

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div className={styles.overlay} onClick={handleOverlayClick}>
            <PortalProvider
                key={`${teacherId || "noTeacher"}_${date || "noDate"}`}
                initTeacherId={teacherId}
                initSchoolId={schoolId}
                initDate={date}
            >
                <InnerContent onClose={onClose} teacherName={teacherName} />
            </PortalProvider>
        </div>
    );
};

export default TeacherMaterial;
