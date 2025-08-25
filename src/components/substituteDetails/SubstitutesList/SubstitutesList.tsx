"use client";

import React from "react";
import TableList from "../../core/TableList/TableList";
import { useMainContext } from "@/context/MainContext";
import messages from "@/resources/messages";
import { getStorageSchoolId } from "@/utils/localStorage";
import useDeletePopup from "@/hooks/useDeletePopup";
import { PopupAction } from "@/context/PopupContext";
import { filterTeachersByRole, sortByHebrewName } from "@/utils/format";
import { TeacherRoleValues, TeacherType } from "@/models/types/teachers";
import useSubmit from "@/hooks/useSubmit";
import EmptyTable from "@/components/ui/table/EmptyTable/EmptyTable";
import SubstituteRow from "../SubstituteRow/SubstituteRow";
import AddSubstituteRow from "../AddSubstituteRow/AddSubstituteRow";

const SubstitutesList: React.FC = () => {
    const { handleOpenPopup } = useDeletePopup();
    const { teachers, deleteTeacher } = useMainContext();

    const { handleSubmitDelete } = useSubmit(
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
                ? filterTeachersByRole(sortByHebrewName(teachers), TeacherRoleValues.SUBSTITUTE)
                : undefined,
        [teachers],
    );

    return (
        <TableList headThs={["שם המורה", "פעולות"]}>
            <tbody>
                <AddSubstituteRow />
                {sortedTeachers?.length === 0 ? (
                    <EmptyTable text="עדיין לא נוספו מורים לרשימה" />
                ) : (
                    sortedTeachers?.map((teacher: TeacherType) => (
                        <SubstituteRow
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

export default SubstitutesList;
