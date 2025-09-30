"use client";

import React from "react";
import { useMainContext } from "@/context/MainContext";
import useDeletePopup from "@/hooks/useDeletePopup";
import useSubmit from "@/hooks/useSubmit";
import { PopupAction } from "@/context/PopupContext";
import { filterTeachersByRole } from "@/utils/format";
import { sortByHebrewName } from "@/utils/sort";
import messages from "@/resources/messages";
import { TeacherRoleValues, TeacherType } from "@/models/types/teachers";
import TableList from "../../ui/list/TableList/TableList";
import AddTeacherRow from "../AddTeacherRow/AddTeacherRow";
import TeacherRow from "../TeacherRow/TeacherRow";
import EmptyTable from "@/components/ui/table/EmptyTable/EmptyTable";
import ListRowLoading from "@/components/layout/loading/ListRowLoading/ListRowLoading";

const TeachersList: React.FC = () => {
    const { handleOpenPopup } = useDeletePopup();
    const { teachers, deleteTeacher, school } = useMainContext();

    const { handleSubmitDelete } = useSubmit(
        () => {},
        messages.teachers.deleteSuccess,
        messages.teachers.deleteError,
        messages.teachers.invalid,
    );

    const handleDeleteTeacherFromState = async (teacherId: string) => {
        if (!school?.id) return;
        await handleSubmitDelete(school.id, teacherId, deleteTeacher);
    };

    const handleDeleteTeacher = (teacher: TeacherType) => {
        handleOpenPopup(
            PopupAction.deleteTeacher,
            `האם למחוק את המורה ${teacher.name}`,
            () => handleDeleteTeacherFromState(teacher.id),
        );
    };

    const sortedTeachers = React.useMemo(
        () =>
            teachers !== undefined
                ? filterTeachersByRole(sortByHebrewName(teachers), TeacherRoleValues.REGULAR)
                : undefined,
        [teachers],
    );

    return (
        <TableList headThs={["שם המורה", "פעולות"]}>
            <tbody>
                <AddTeacherRow />
                {sortedTeachers === undefined ? (
                    <ListRowLoading />
                ) : sortedTeachers?.length === 0 ? (
                    <EmptyTable text="עדיין לא נוספו מורים לרשימה" />
                ) : (
                    sortedTeachers?.map((teacher: TeacherType) => (
                        <TeacherRow
                            key={teacher.id}
                            teacher={teacher}
                            handleDeleteTeacher={handleDeleteTeacher}
                        />
                    ))
                )}
            </tbody>
        </TableList>
    );
};

export default TeachersList;