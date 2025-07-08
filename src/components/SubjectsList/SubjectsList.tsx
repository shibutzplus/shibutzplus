"use client";

import React from "react";
import styles from "./SubjectsList.module.css";
import { SubjectType } from "@/models/types/subjects";
import TableList from "../core/TableList/TableList";
import { useMainContext } from "@/context/MainContext";
import useSubmit from "@/hooks/useSubmit";
import messages from "@/resources/messages";
import { getStorageSchoolId } from "@/utils/localStorage";
import useDeletePopup from "@/hooks/useDeletePopup";
import { PopupAction } from "@/context/PopupContext";

type SubjectsListProps = {
    subjects: SubjectType[];
    handleSelectSubject: (subject: SubjectType) => void;
};

const SubjectsList: React.FC<SubjectsListProps> = ({ subjects, handleSelectSubject }) => {
    const { handleOpenPopup } = useDeletePopup();
    const { deleteSubject } = useMainContext();

    const { handleSubmitDelete, isLoading } = useSubmit(
        () => {},
        messages.subjects.deleteSuccess,
        messages.subjects.deleteError,
        messages.subjects.invalid,
    );

    const handleDeleteSubjectFromState = async (subjectId: string) => {
        const schoolId = getStorageSchoolId();
        if (!schoolId) return;
        await handleSubmitDelete(schoolId, subjectId, deleteSubject);
    };

    const handleDeleteSubject = (e: React.MouseEvent, subject: SubjectType) => {
        e.stopPropagation(); // Prevent row click when clicking delete
        handleOpenPopup(
            PopupAction.deleteSubject,
            `האם אתה בטוח שברצונך למחוק את המקצוע ${subject.name}`,
            () => handleDeleteSubjectFromState(subject.id),
        );
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
