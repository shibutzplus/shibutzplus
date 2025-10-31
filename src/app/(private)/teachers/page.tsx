"use client";

import React from "react";
import { NextPage } from "next";
import DetailsListLayout from "@/components/layout/DetailsListLayout/DetailsListLayout";
import { useMainContext } from "@/context/MainContext";
import { TeacherRoleValues, TeacherType } from "@/models/types/teachers";
import AddTeacherRow from "@/components/details/teacherDetails/AddTeacherRow/AddTeacherRow";
import TeacherRow from "@/components/details/teacherDetails/TeacherRow/TeacherRow";
import { filterTeachersByRole } from "@/utils/format";
import { sortByHebrewName } from "@/utils/sort";

const TeachersPage: NextPage = () => {
    const { teachers } = useMainContext();

    const sortedTeachers = React.useMemo(
        () =>
            teachers !== undefined
                ? filterTeachersByRole(sortByHebrewName(teachers), TeacherRoleValues.REGULAR)
                : undefined,
        [teachers],
    );

    return (
        <DetailsListLayout<TeacherType>
            titles={["שם המורה", "פעולות"]}
            emptyText="עדיין לא נוספו מורים לרשימה"
            details={sortedTeachers}
        >
            <AddTeacherRow />
            {sortedTeachers?.map((teacher: TeacherType) => (
                <TeacherRow key={teacher.id} teacher={teacher} />
            ))}
        </DetailsListLayout>
    );
};

export default TeachersPage;
