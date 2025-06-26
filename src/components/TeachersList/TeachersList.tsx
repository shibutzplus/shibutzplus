"use client";

import React from "react";
import styles from "./TeachersList.module.css";
import { TeacherType } from "@/models/types/teachers";
import { usePopup } from "@/context/PopupContext";
import TableList from "../core/TableList/TableList";
import { useMainContext } from "@/context/MainContext";
import DeletePopup from "../popups/DeletePopup/DeletePopup";

type TeachersListProps = {
    teachers: TeacherType[];
    handleSelectTeacher: (teacher: TeacherType) => void;
};

const TeachersList: React.FC<TeachersListProps> = ({ teachers, handleSelectTeacher }) => {
    const { openPopup, closePopup } = usePopup();
    const { deleteTeacher } = useMainContext();

    const handleDeleteTeacherFromState = (teacherId: string) => {
        deleteTeacher(teacherId);
        closePopup();
    };

    const handleOpenPopup = (teacher: TeacherType) => {
        openPopup(
            "deleteTeacher",
            "S",
            <DeletePopup
                text={`האם אתה בטוח שברצונך למחוק את המורה ${teacher.name}`}
                onDelete={() => handleDeleteTeacherFromState(teacher.id)}
                onCancel={() => closePopup()}
            />,
        );
    };

    const handleDeleteTeacher = (e: React.MouseEvent, teacher: TeacherType) => {
        e.stopPropagation(); // Prevent row click when clicking delete
        handleOpenPopup(teacher);
    };

    const displayRole = (role: string): React.ReactNode => {
        switch (role) {
            case "homeroom":
                return (
                    <td className={styles.roleCellGreen}>
                        <span>מחנך/ת</span>
                    </td>
                );
            case "substitute":
                return (
                    <td className={styles.roleCellBlue}>
                        <span>מחליף/ה</span>
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
        <TableList headThs={["שם", "תפקיד", ""]}>
            <tbody>
                {teachers.map((teacher) => (
                    <tr
                        key={teacher.id}
                        className={styles.teacherRow}
                        onClick={() => handleSelectTeacher(teacher)}
                    >
                        <td>{teacher.name}</td>
                        {displayRole(teacher.role)}
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
