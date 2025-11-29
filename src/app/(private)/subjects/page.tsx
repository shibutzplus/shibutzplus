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
    const [searchTerm, setSearchTerm] = React.useState("");

    const sortedSubjects = React.useMemo(
        () => {
            if (!subjects) return undefined;
            const filtered = subjects.filter(s => s.name.includes(searchTerm));
            return sortByHebrewName(filtered);
        },
        [subjects, searchTerm],
    );

    return (
        <DetailsListLayout<SubjectType>
            titles={["שם המקצוע", "פעולות"]}
            emptyText={
                searchTerm ? (
                    <div style={{ textAlign: "center" }}>
                        לא נמצאה התאמה לחיפוש.
                        <br />
                        <br />
                        להוספת מקצוע חדש, לחצו על הוספה
                    </div>
                ) : (
                    "עדיין לא נוספו מקצועות לרשימה"
                )
            }
            details={sortedSubjects}
        >
            <AddSubjectRow onSearch={setSearchTerm} />
            {sortedSubjects?.map((subject: SubjectType) => (
                <SubjectRow key={subject.id} subject={subject} />
            ))}
        </DetailsListLayout>
    );
};

export default SubjectsPage;
