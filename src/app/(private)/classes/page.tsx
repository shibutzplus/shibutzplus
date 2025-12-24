"use client";

import React from "react";
import { NextPage } from "next";
import DetailsListLayout from "@/components/layout/DetailsListLayout/DetailsListLayout";
import { useMainContext } from "@/context/MainContext";
import AddClassRow from "@/components/details/classDetails/AddClassRow/AddClassRow";
import ClassRow from "@/components/details/classDetails/ClassRow/ClassRow";
import { ClassType } from "@/models/types/classes";

const ClassesPage: NextPage = () => {
    const { classes } = useMainContext();
    const [searchTerm, setSearchTerm] = React.useState("");

    const sortedClasses = React.useMemo(
        () => {
            if (!classes) return undefined;
            return classes
                .filter(c => !c.activity && c.name.includes(searchTerm))
                .sort((a, b) => a.name.localeCompare(b.name, "he", { numeric: true }));
        },
        [classes, searchTerm],
    );

    return (
        <DetailsListLayout<ClassType>
            titles={["שם הכיתה", "פעולות"]}
            emptyText={
                searchTerm ? (
                    <div style={{ textAlign: "center" }}>
                        לא נמצאה התאמה לחיפוש.
                        <br />
                        <br />
                        להוספת כיתה חדשה, לחצו על הוספה
                    </div>
                ) : (
                    "עדיין לא נוספו כיתות לרשימה"
                )
            }
            details={sortedClasses}
            headerAction={<AddClassRow onSearch={setSearchTerm} />}
        >
            {sortedClasses?.map((cls: ClassType) => (
                <ClassRow key={cls.id} classItem={cls} />
            ))}
        </DetailsListLayout>
    );
};

export default ClassesPage;
