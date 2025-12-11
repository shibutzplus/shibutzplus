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
    const [searchTerm, setSearchTerm] = React.useState("");

    const sortedTeachers = React.useMemo(
        () => {
            if (!teachers) return undefined;
            const filtered = teachers.filter(t => t.name.includes(searchTerm));
            return filterTeachersByRole(sortByHebrewName(filtered), TeacherRoleValues.SUBSTITUTE);
        },
        [teachers, searchTerm],
    );

    return (
        <DetailsListLayout<TeacherType>
            titles={["שם המורה", "פעולות"]}
            emptyText={
                searchTerm ? (
                    <div style={{ textAlign: "center" }}>
                        לא נמצאה התאמה לחיפוש.
                        <br />
                        <br />
                        להוספת מורה מחליף חדש, לחצו על הוספה
                    </div>
                ) : (
                    "עדיין לא נוספו מורים לרשימה"
                )
            }
            details={sortedTeachers}
            headerAction={<AddSubstituteRow onSearch={setSearchTerm} />}
        >
            {sortedTeachers?.map((teacher: TeacherType) => (
                <SubstituteRow key={teacher.id} teacher={teacher} />
            ))}
        </DetailsListLayout>
    );
};

export default SubstitutePage;
