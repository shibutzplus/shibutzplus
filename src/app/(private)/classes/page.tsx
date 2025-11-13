"use client";

import React from "react";
import { NextPage } from "next";
import DetailsListLayout from "@/components/layout/DetailsListLayout/DetailsListLayout";
import { useMainContext } from "@/context/MainContext";
import AddClassRow from "@/components/details/classDetails/AddClassRow/AddClassRow";
import ClassRow from "@/components/details/classDetails/ClassRow/ClassRow";
import { sortByHebrewName } from "@/utils/sort";
import { ClassType } from "@/models/types/classes";
import ListSkeleton from "@/components/loading/skeleton/ListSkeleton/ListSkeleton";

const ClassesPage: NextPage = () => {
    const { classes } = useMainContext();

    const sortedClasses = React.useMemo(
        () => (classes !== undefined ? sortByHebrewName(classes) : undefined),
        [classes],
    );

    return (
        <DetailsListLayout<ClassType>
            titles={["שם הכיתה", "פעולות"]}
            emptyText="עדיין לא נוספו כיתות לרשימה"
            details={sortedClasses}
        >
            <AddClassRow />
            {sortedClasses?.map((classItem) => (
                <ClassRow key={classItem.id} classItem={classItem} />
            ))}
        </DetailsListLayout>
    );
};

export default ClassesPage;
