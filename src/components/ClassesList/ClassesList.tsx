"use client";

import React from "react";
import styles from "./ClassesList.module.css";
import { ClassType } from "@/models/types/classes";
import { usePopup } from "@/context/PopupContext";
import TableList from "../core/TableList/TableList";
import DeleteClassPopup from "../popups/DeleteClassPopup/DeleteClassPopup";
import { useMainContext } from "@/context/MainContext";

type ClassesListProps = {
    classes: ClassType[];
    handleSelectClass: (classItem: ClassType) => void;
};

const ClassesList: React.FC<ClassesListProps> = ({ classes, handleSelectClass }) => {
    const { openPopup, closePopup } = usePopup();
    const { deleteClass } = useMainContext();

    const handleDeleteClassFromState = (classId: string) => {
        // Use the MainContext's deleteClass function
        deleteClass(classId);
        
        // Close the popup after deletion
        closePopup();
    };

    const handleOpenPopup = (classItem: ClassType) => {
        openPopup(
            "deleteClass",
            "S",
            <DeleteClassPopup 
                classItem={classItem} 
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
