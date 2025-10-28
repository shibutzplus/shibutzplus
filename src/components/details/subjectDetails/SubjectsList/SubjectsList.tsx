"use client";

import React from "react";
import { useMainContext } from "@/context/MainContext";
import useDeletePopup from "@/hooks/useDeletePopup";
import useSubmit from "@/hooks/useSubmit";
import { PopupAction } from "@/context/PopupContext";
import { sortByHebrewName } from "@/utils/sort";
import messages from "@/resources/messages";
import { SubjectType } from "@/models/types/subjects";
import TableList from "../../../ui/list/TableList/TableList";
import SubjectRow from "../SubjectRow/SubjectRow";
import AddSubjectRow from "../AddSubjectRow/AddSubjectRow";
import EmptyTable from "@/components/ui/table/EmptyTable/EmptyTable";
import ListRowLoading from "@/components/loading/ListRowLoading/ListRowLoading";

const SubjectsList: React.FC = () => {
    const { handleOpenPopup } = useDeletePopup();
    const { subjects, deleteSubject, school } = useMainContext();

    const { handleSubmitDelete } = useSubmit(
        () => { },
        messages.subjects.deleteSuccess,
        messages.subjects.deleteError,
        messages.subjects.invalid,
    );

    const handleDeleteSubjectFromState = async (subjectId: string) => {
        if (!school?.id) return;
        await handleSubmitDelete(school.id, subjectId, deleteSubject);
    };

    const handleDeleteSubject = (subject: SubjectType) => {
        handleOpenPopup(
            PopupAction.deleteSubject,
            `האם אתה בטוח שברצונך למחוק את המקצוע ${subject.name}`,
            () => handleDeleteSubjectFromState(subject.id),
        );
    };

    const sortedSubjects = React.useMemo(
        () => (subjects !== undefined ? sortByHebrewName(subjects) : undefined),
        [subjects],
    );

    return (
        <TableList headThs={["שם המקצוע", "פעולות"]}>
            <tbody>
                <AddSubjectRow />
                {subjects === undefined ? (
                    <ListRowLoading />
                ) : sortedSubjects?.length === 0 ? (
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
