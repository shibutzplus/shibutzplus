"use client";

import React from "react";
import styles from "./ClassesList.module.css";
import { ClassType } from "@/models/types/classes";
import TableList from "../core/TableList/TableList";
import { useMainContext } from "@/context/MainContext";
import useSubmit from "@/hooks/useSubmit";
import messages from "@/resources/messages";
import { getStorageSchoolId } from "@/utils/localStorage";
import useDeletePopup from "@/hooks/useDeletePopup";
import { PopupAction } from "@/context/PopupContext";

type ClassesListProps = {
    classes: ClassType[];
    handleSelectClass: (classItem: ClassType) => void;
};

const ClassesList: React.FC<ClassesListProps> = ({ classes, handleSelectClass }) => {
    const { handleOpenPopup } = useDeletePopup();
    const { deleteClass } = useMainContext();

    const { handleSubmitDelete, isLoading } = useSubmit(
        () => {},
        messages.classes.deleteSuccess,
        messages.classes.deleteError,
        messages.classes.invalid,
    );

    const handleDeleteClassFromState = async (classId: string) => {
        const schoolId = getStorageSchoolId();
        if (!schoolId) return;
        await handleSubmitDelete(schoolId, classId, deleteClass);
    };

    const handleDeleteClass = (e: React.MouseEvent, classItem: ClassType) => {
        e.stopPropagation(); // Prevent row click when clicking delete
        handleOpenPopup(
            PopupAction.deleteClass,
            `האם אתה בטוח שברצונך למחוק את הכיתה ${classItem.name}`,
            () => handleDeleteClassFromState(classItem.id),
        );
    };

    return (
        <TableList headThs={["שם כיתה", ""]}>
            <tbody>
                {classes.map((classItem) => (
                    <tr
                        key={classItem.id}
                        className={styles.classRow}
                        onClick={() => handleSelectClass(classItem)}
                    >
                        <td>{classItem.name}</td>
                        <td>
                            <button
                                className={styles.deleteBtn}
                                aria-label="מחק"
                                onClick={(e) => handleDeleteClass(e, classItem)}
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

export default ClassesList;
