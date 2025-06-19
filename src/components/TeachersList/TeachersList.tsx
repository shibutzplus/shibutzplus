"use client";

import React from "react";
import styles from "./TeachersList.module.css";
import { Teacher } from "@/models/types/teachers";
import { usePopup } from "@/context/PopupContext";
import DeleteTeacherPopup from "../popups/DeleteTeacherPopup/DeleteTeacherPopup";
import TableList from "../core/TableList/TableList";
import { IoTrashBin } from "react-icons/io5";

type TeachersListProps = {
    teachers: Teacher[];
    handleSelectTeacher: (teacher: Teacher) => void;
};

const TeachersList: React.FC<TeachersListProps> = ({ teachers, handleSelectTeacher }) => {
    const { openPopup } = usePopup();

    const handleOpenPopup = (teacher: Teacher) => {
        openPopup(
            "deleteTeacher",
            "S",
            <DeleteTeacherPopup teacher={teacher} onDelete={() => {}} onCancel={() => {}} />,
        );
    };

    const handleDeleteTeacher = (e: React.MouseEvent, teacher: Teacher) => {
        e.stopPropagation(); // Prevent row click when clicking delete
        handleOpenPopup(teacher);
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
        <TableList headThs={["שם מלא", "תפקיד", "כיתה ראשית", ""]}>
            <tbody>
                {teachers.map((teacher) => (
                    <tr
                        key={teacher.id}
                        className={styles.teacherRow}
                        onClick={() => handleSelectTeacher(teacher)}
                    >
                        <td>{teacher.name}</td>
                        {displayRole(teacher.role)}
                        <td>{teacher.primaryClass || ""}</td>
                        <td>
                            <button
                                className={styles.deleteBtn}
                                aria-label="מחק"
                                onClick={(e) => handleDeleteTeacher(e, teacher)}
                            >
                                מחיקה
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </TableList>
    );
};

export default TeachersList;

{
    /* <div className={styles.actionButtons}>
                                    <button
                                        className={styles.deleteButton}
                                        aria-label="מחק"
                                        onClick={(e) => handleDeleteTeacher(e, teacher)}
                                    >
                                        <IoTrashBin className={styles.deleteIcon} size={20} />
                                    </button>
                                </div> */
}
