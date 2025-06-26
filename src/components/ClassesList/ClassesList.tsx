"use client";

import React from "react";
import styles from "./ClassesList.module.css";
import { ClassType } from "@/models/types/classes";
import { usePopup } from "@/context/PopupContext";
import TableList from "../core/TableList/TableList";
import { useMainContext } from "@/context/MainContext";
import DeletePopup from "../popups/DeletePopup/DeletePopup";
import useSubmit from "@/hooks/useSubmit";
import messages from "@/resources/messages";
import { getStorageSchoolId } from "@/utils/localStorage";

type ClassesListProps = {
    classes: ClassType[];
    handleSelectClass: (classItem: ClassType) => void;
};

const ClassesList: React.FC<ClassesListProps> = ({ classes, handleSelectClass }) => {
    const { openPopup, closePopup } = usePopup();
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
        closePopup();
    };

    const handleOpenPopup = (classItem: ClassType) => {
        openPopup(
            "deleteClass",
            "S",
            <DeletePopup
                text={`האם אתה בטוח שברצונך למחוק את הכיתה ${classItem.name}`}
                onDelete={() => handleDeleteClassFromState(classItem.id)}
                onCancel={() => closePopup()}
            />,
        );
    };

    const handleDeleteClass = (e: React.MouseEvent, classItem: ClassType) => {
        e.stopPropagation(); // Prevent row click when clicking delete
        handleOpenPopup(classItem);
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
