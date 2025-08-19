"use client";

import React from "react";
import styles from "./TeachersList.module.css";
import { TeacherType } from "@/models/types/teachers";
import TableList from "../../core/TableList/TableList";
import { useMainContext } from "@/context/MainContext";
import useSubmit from "@/hooks/useSubmit";
import messages from "@/resources/messages";
import { getStorageSchoolId } from "@/utils/localStorage";
import useDeletePopup from "@/hooks/useDeletePopup";
import { PopupAction } from "@/context/PopupContext";
import { sortByHebrewName } from "@/utils/format";

type TeachersListProps = {
    teachers: TeacherType[];
    handleSelectTeacher: (teacher: TeacherType) => void;
};

const TeachersList: React.FC<TeachersListProps> = ({ teachers, handleSelectTeacher }) => {
    const { handleOpenPopup } = useDeletePopup();
    const { deleteTeacher } = useMainContext();

    const { handleSubmitDelete, isLoading } = useSubmit(
        () => {},
        messages.teachers.deleteSuccess,
        messages.teachers.deleteError,
        messages.teachers.invalid,
    );

    const handleDeleteTeacherFromState = async (teacherId: string) => {
        const schoolId = getStorageSchoolId();
        if (!schoolId) return;
        await handleSubmitDelete(schoolId, teacherId, deleteTeacher);
    };

    const handleDeleteTeacher = (e: React.MouseEvent, teacher: TeacherType) => {
        e.stopPropagation(); // Prevent row click when clicking delete
        handleOpenPopup(
            PopupAction.deleteTeacher,
            `האם אתה בטוח שברצונך למחוק את המורה ${teacher.name}`,
            () => handleDeleteTeacherFromState(teacher.id),
        );
    };

    const displayRole = (role: string): React.ReactNode => {
        switch (role) {
            case "regular":
                return (
                    <td className={styles.roleCellGreen}>
                        <span>מורה</span>
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

    const sortedTeachers = sortByHebrewName(teachers);

    return (
        <TableList headThs={["שם", "סטטוס", ""]}>
            <tbody>
                {sortedTeachers.map((teacher) => (
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
