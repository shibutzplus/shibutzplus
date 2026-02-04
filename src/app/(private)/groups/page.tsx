"use client";

import React from "react";
import { NextPage } from "next";
import DetailsListLayout from "@/components/layout/DetailsListLayout/DetailsListLayout";
import { useMainContext } from "@/context/MainContext";
import AddClassRow from "@/components/details/classDetails/AddClassRow/AddClassRow";
import ClassRow from "@/components/details/classDetails/ClassRow/ClassRow";
import { ClassType } from "@/models/types/classes";
import { sortByName } from "@/utils/sort";

const GroupsPage: NextPage = () => {
    const { classes } = useMainContext();
    const [searchTerm, setSearchTerm] = React.useState("");

    const sortedGroups = React.useMemo(
        () => {
            if (!classes) return undefined;
            // Filter for activity=true (groups)
            return classes
                .filter(c => c.activity && c.name.includes(searchTerm))
                .sort(sortByName);
        },
        [classes, searchTerm],
    );

    return (
        <DetailsListLayout<ClassType>
            titles={["קבוצות עבודה", "פעולות"]}
            emptyText={
                searchTerm ? (
                    <div style={{ textAlign: "center" }}>
                        לא נמצאה התאמה לחיפוש.
                        <br />
                        <br />
                        להוספת קבוצה חדשה, לחצו על הוספה
                    </div>
                ) : (
                    "עדיין לא נוספו קבוצות לרשימה"
                )
            }
            details={sortedGroups}
            headerAction={<AddClassRow onSearch={setSearchTerm} isGroup />}
        >
            {sortedGroups?.map((cls: ClassType) => (
                <ClassRow key={cls.id} classItem={cls} />
            ))}
        </DetailsListLayout>
    );
};

export default GroupsPage;
