"use client";

import React from "react";
import TableList from "../../core/TableList/TableList";
import { useMainContext } from "@/context/MainContext";
import messages from "@/resources/messages";
import { getStorageSchoolId } from "@/utils/localStorage";
import useDeletePopup from "@/hooks/useDeletePopup";
import { PopupAction } from "@/context/PopupContext";
import { sortByHebrewName } from "@/utils/format";
import SubjectRow from "../SubjectRow/SubjectRow";
import { SubjectType } from "@/models/types/subjects";
import useSubmit from "@/hooks/useSubmit";
import AddSubjectRow from "../AddSubjectRow/AddSubjectRow";

type SubjectsListProps = {};

const SubjectsList: React.FC<SubjectsListProps> = () => {
    const { handleOpenPopup } = useDeletePopup();
    const { subjects, deleteSubject } = useMainContext();

    const { handleSubmitDelete } = useSubmit(
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

    const sortedSubjects = sortByHebrewName(subjects || []);

    return (
        <TableList headThs={["שם המקצוע", "פעולות"]}>
            <tbody>
                <AddSubjectRow />
                {sortedSubjects.map((subject: SubjectType) => (
                    <SubjectRow
                        key={subject.id}
                        subject={subject}
                        handleDeleteSubject={handleDeleteSubject}
                    />
                ))}
            </tbody>
        </TableList>
    );
};

export default SubjectsList;
