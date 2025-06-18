"use client";

import React from "react";
import styles from "./TeachersList.module.css";
import { Teacher } from "@/models/types/teachers";
import { usePopup } from "@/context/PopupContext";
import DeleteTeacherPopup from "../popups/DeleteTeacherPopup/DeleteTeacherPopup";
import TableList from "../core/TableList/TableList";

type TeachersListProps = {
    teachers: Teacher[];
};

const TeachersList: React.FC<TeachersListProps> = ({ teachers }) => {
    const { openPopup } = usePopup();

    const handleOpenPopup = (teacher: Teacher) => {
        openPopup(
            "deleteTeacher",
            "S",
            <DeleteTeacherPopup teacher={teacher} onDelete={() => {}} onCancel={() => {}} />,
        );
    };

    const displayRole = (role: string): React.ReactNode => {
        switch (role) {
            case "מורה קיים":
                return (
                    <td className={styles.roleCellGreen}>
                        <span>קבוע</span>
                    </td>
                );
            case "מורה מחליף":
                return (
                    <td className={styles.roleCellBlue}>
                        <span>מחליף</span>
                    </td>
                );
            default:
                return (
                    <td className={styles.roleCell}>
                        <span>-</span>
                    </td>
                );
        }
    };

    return (
        <section className={styles.teachersListSection}>
            <h1 className={styles.title}>רשימת מורים</h1>
            <div className={styles.teachersCount}>
                {teachers.length} מורים | 5 קבועים, 3 מחליפים
            </div>
            <TableList headThs={["שם מלא", "תפקיד", "מקצוע", "כיתות", "פעולות"]}>
                <tbody>
                    {teachers.map((teacher) => (
                        <tr key={teacher.id}>
                            <td>{teacher.name}</td>
                            {displayRole(teacher.role)}
                            <td>{teacher.subject || "-"}</td>
                            <td>{teacher.classes.join(", ")}</td>
                            <td>
                                <div className={styles.actionButtons}>
                                    <button className={styles.editButton} aria-label="ערוך">
                                        <span className={styles.editIcon}>✏️</span>
                                    </button>
                                    <button
                                        className={styles.deleteButton}
                                        aria-label="מחק"
                                        onClick={() => handleOpenPopup(teacher)}
                                    >
                                        <span className={styles.deleteIcon}>🗑️</span>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </TableList>
        </section>
    );
};

export default TeachersList;
