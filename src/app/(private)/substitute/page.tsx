"use client";

import React from "react";
import { NextPage } from "next";
import DetailsListLayout from "@/components/layout/DetailsListLayout/DetailsListLayout";
import { useMainContext } from "@/context/MainContext";
import { TeacherRoleValues, TeacherType } from "@/models/types/teachers";
import AddSubstituteRow from "@/components/details/substituteDetails/AddSubstituteRow/AddSubstituteRow";
import SubstituteRow from "@/components/details/substituteDetails/SubstituteRow/SubstituteRow";
import { filterTeachersByRole } from "@/utils/format";
import { sortByHebrewName } from "@/utils/sort";

const SubstitutePage: NextPage = () => {
    const { teachers } = useMainContext();

    const sortedTeachers = React.useMemo(
        () =>
            teachers !== undefined
                ? filterTeachersByRole(sortByHebrewName(teachers), TeacherRoleValues.SUBSTITUTE)
                : undefined,
        [teachers],
    );

    return (
        <DetailsListLayout<TeacherType>
            titles={["שם המורה", "פעולות"]}
            emptyText="עדיין לא נוספו מורים לרשימה"
            details={sortedTeachers}
        >
            <AddSubstituteRow />
            {sortedTeachers?.map((teacher: TeacherType) => (
                <SubstituteRow key={teacher.id} teacher={teacher} />
            ))}
        </DetailsListLayout>
    );
};

export default SubstitutePage;
