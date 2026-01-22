"use client";

import React from "react";
import { NextPage } from "next";
import DetailsListLayout from "@/components/layout/DetailsListLayout/DetailsListLayout";
import { useMainContext } from "@/context/MainContext";
import { TeacherRoleValues, TeacherType } from "@/models/types/teachers";
import AddStaffRow from "@/components/details/staffDetails/AddStaffRow/AddStaffRow";
import StaffRow from "@/components/details/staffDetails/StaffRow/StaffRow";
import { filterTeachersByRole } from "@/utils/format";
import { sortByName } from "@/utils/sort";

const StaffPage: NextPage = () => {
    const { teachers } = useMainContext();
    const [searchTerm, setSearchTerm] = React.useState("");

    const sortedTeachers = React.useMemo(
        () => {
            if (!teachers) return undefined;
            const filtered = teachers.filter(t => t.name.includes(searchTerm));
            const hasRole = filterTeachersByRole(filtered, TeacherRoleValues.STAFF);
            return hasRole.sort(sortByName);
        },
        [teachers, searchTerm],
    );

    return (
        <DetailsListLayout<TeacherType>
            titles={["שם", "פעולות"]}
            emptyText={
                searchTerm ? (
                    <div style={{ textAlign: "center" }}>
                        לא נמצאה התאמה לחיפוש.
                        <br />
                        <br />
                        להוספת איש מנהלה חדש, לחצו על הוספה
                    </div>
                ) : (
                    "עדיין לא נוספו אנשי מנהלה לרשימה"
                )
            }
            details={sortedTeachers}
            headerAction={<AddStaffRow onSearch={setSearchTerm} />}
            footer={
                <div style={{ padding: "10px", fontSize: "0.85rem", textAlign: "center", color: "var(--light-text-color)" }}>
                    אנשי מנהלה הם חברי סגל (כגון מזכירות) שאינם עוסקים בהוראה, אך ניתנת להם הרשאת צפייה במערכת.
                </div>
            }
        >
            {sortedTeachers?.map((teacher: TeacherType) => (
                <StaffRow key={teacher.id} teacher={teacher} />
            ))}
        </DetailsListLayout>
    );
};

export default StaffPage;
