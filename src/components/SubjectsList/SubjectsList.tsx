"use client";

import React from "react";
import styles from "./SubjectsList.module.css";
import { SubjectType } from "@/models/types/subjects";
import { usePopup } from "@/context/PopupContext";
import TableList from "../core/TableList/TableList";
import DeleteSubjectPopup from "../popups/DeleteSubjectPopup/DeleteSubjectPopup";
import { useMainContext } from "@/context/MainContext";

type SubjectsListProps = {
    subjects: SubjectType[];
    handleSelectSubject: (subject: SubjectType) => void;
};

const SubjectsList: React.FC<SubjectsListProps> = ({ subjects, handleSelectSubject }) => {
    const { openPopup, closePopup } = usePopup();
    const { deleteSubject } = useMainContext();

    const handleDeleteSubjectFromState = (subjectId: string) => {
        deleteSubject(subjectId);
        closePopup();
    };

    const handleOpenPopup = (subject: SubjectType) => {
        openPopup(
            "deleteSubject",
            "S",
            <DeleteSubjectPopup
                subject={subject}
                onDelete={() => handleDeleteSubjectFromState(subject.id)}
                onCancel={() => closePopup()}
            />,
        );
    };

    const handleDeleteSubject = (e: React.MouseEvent, subject: SubjectType) => {
        e.stopPropagation(); // Prevent row click when clicking delete
        handleOpenPopup(subject);
    };

    return (
        <TableList headThs={["שם מקצוע", ""]}>
            <tbody>
                {subjects.map((subject) => (
                    <tr
                        key={subject.id}
                        className={styles.subjectRow}
                        onClick={() => handleSelectSubject(subject)}
                    >
                        <td>{subject.name}</td>
                        <td>
                            <button
                                className={styles.deleteBtn}
                                aria-label="מחק"
                                onClick={(e) => handleDeleteSubject(e, subject)}
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

export default SubjectsList;
