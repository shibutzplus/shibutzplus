"use client";

import React from "react";
import TableList from "../../core/TableList/TableList";
import { useMainContext } from "@/context/MainContext";
import messages from "@/resources/messages";
import { getStorageSchoolId } from "@/utils/localStorage";
import useDeletePopup from "@/hooks/useDeletePopup";
import { PopupAction } from "@/context/PopupContext";
import { sortByHebrewName } from "@/utils/format";
import { TeacherType } from "@/models/types/teachers";
import useSubmit from "@/hooks/useSubmit";
import AddTeacherRow from "../AddTeacherRow/AddTeacherRow";
import TeacherRow from "../teacherRow/teacherRow";

const TeachersList: React.FC = () => {
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

    const handleDeleteTeacher = (e: React.MouseEvent, teacher: TeacherType) => {
        e.stopPropagation(); // Prevent row click when clicking delete
        handleOpenPopup(
            PopupAction.deleteTeacher,
            `האם אתה בטוח שברצונך למחוק את המורה ${teacher.name}`,
            () => handleDeleteTeacherFromState(teacher.id),
        );
    };

    const sortedTeachers = sortByHebrewName(teachers || []);

    return (
        <TableList headThs={["שם המורה", "תפקיד", "פעולות"]}>
            <tbody>
                <AddTeacherRow />
                {sortedTeachers.map((teacher: TeacherType) => (
                    <TeacherRow
                        key={teacher.id}
                        teacher={teacher}
                        handleDeleteTeacher={handleDeleteTeacher}
                    />
                ))}
            </tbody>
        </TableList>
    );
};

export default TeachersList;
