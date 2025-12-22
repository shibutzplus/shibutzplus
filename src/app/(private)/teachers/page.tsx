"use client";

import React from "react";
import { NextPage } from "next";
import DetailsListLayout from "@/components/layout/DetailsListLayout/DetailsListLayout";
import { useMainContext } from "@/context/MainContext";
import { TeacherRoleValues, TeacherType } from "@/models/types/teachers";
import AddTeacherRow from "@/components/details/teacherDetails/AddTeacherRow/AddTeacherRow";
import TeacherRow from "@/components/details/teacherDetails/TeacherRow/TeacherRow";
import { filterTeachersByRole } from "@/utils/format";


const TeachersPage: NextPage = () => {
    const { teachers } = useMainContext();
    const [searchTerm, setSearchTerm] = React.useState("");

    const sortedTeachers = React.useMemo(
        () => {
            if (!teachers) return undefined;
            const filtered = teachers.filter(t => t.name.includes(searchTerm));
            return filterTeachersByRole(filtered, TeacherRoleValues.REGULAR);
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
                        להוספת מורה חדש, לחצו על הוספה
                    </div>
                ) : (
                    "עדיין לא נוספו מורים לרשימה"
                )
            }
            details={sortedTeachers}
            headerAction={<AddTeacherRow onSearch={setSearchTerm} />}
        >
            {sortedTeachers?.map((teacher: TeacherType) => (
                <TeacherRow key={teacher.id} teacher={teacher} />
            ))}
        </DetailsListLayout>
    );
};

export default TeachersPage;
