"use client";

import React from "react";
import TableList from "../../ui/list/TableList/TableList";
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
import EmptyTable from "@/components/ui/table/EmptyTable/EmptyTable";


const SubjectsList: React.FC = () => {
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

    const handleDeleteSubject = (subject: SubjectType) => {
        handleOpenPopup(
            PopupAction.deleteSubject,
            `האם אתה בטוח שברצונך למחוק את המקצוע ${subject.name}`,
            () => handleDeleteSubjectFromState(subject.id),
        );
    };

    const sortedSubjects = React.useMemo(() => (
        subjects !== undefined ? sortByHebrewName(subjects) : undefined
    ), [subjects]);

    return (
        <TableList headThs={["שם המקצוע", "פעולות"]}>
            <tbody>
                <AddSubjectRow />
                {sortedSubjects?.length === 0 ? (
                    <EmptyTable text="עדיין לא נוספו מקצועות לרשימה" />
                ) : (
                    sortedSubjects?.map((subject: SubjectType) => (
                        <SubjectRow
                            key={subject.id}
                            subject={subject}
                            handleDeleteSubject={handleDeleteSubject}
                        />
                    ))
                )}
            </tbody>
        </TableList>
    );
};

export default SubjectsList;
