"use client";

import React from "react";
import { NextPage } from "next";
import DetailsListLayout from "@/components/layout/DetailsListLayout/DetailsListLayout";
import AddSubjectRow from "@/components/details/subjectDetails/AddSubjectRow/AddSubjectRow";
import SubjectRow from "@/components/details/subjectDetails/SubjectRow/SubjectRow";
import { SubjectType } from "@/models/types/subjects";
import { useMainContext } from "@/context/MainContext";
import { sortByHebrewName } from "@/utils/sort";

const SubjectsPage: NextPage = () => {
    const { subjects } = useMainContext();

    const sortedSubjects = React.useMemo(
        () => (subjects !== undefined ? sortByHebrewName(subjects) : undefined),
        [subjects],
    );

    return (
        <DetailsListLayout<SubjectType>
            titles={["שם המקצוע", "פעולות"]}
            emptyText="עדיין לא נוספו מקצועות לרשימה"
            details={sortedSubjects}
        >
            <AddSubjectRow />
            {sortedSubjects?.map((subject: SubjectType) => (
                <SubjectRow key={subject.id} subject={subject} />
            ))}
        </DetailsListLayout>
    );
};

export default SubjectsPage;
