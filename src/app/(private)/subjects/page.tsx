"use client";

import React from "react";
import { NextPage } from "next";
import DetailsListLayout from "@/components/layout/DetailsListLayout/DetailsListLayout";
import AddSubjectRow from "@/components/details/subjectDetails/AddSubjectRow/AddSubjectRow";
import SubjectRow from "@/components/details/subjectDetails/SubjectRow/SubjectRow";
import { SubjectType } from "@/models/types/subjects";
import { useMainContext } from "@/context/MainContext";

const SubjectsPage: NextPage = () => {
    const { subjects } = useMainContext();
    const [searchTerm, setSearchTerm] = React.useState("");

    const sortedSubjects = React.useMemo(
        () => {
            if (!subjects) return undefined;
            return subjects
                .filter(s => !s.activity && s.name.includes(searchTerm))
                .sort((a, b) => a.name.localeCompare(b.name, "he", { numeric: true }));
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
            headerAction={<AddSubjectRow onSearch={setSearchTerm} />}
        >
            {sortedSubjects?.map((subject: SubjectType) => (
                <SubjectRow key={subject.id} subject={subject} />
            ))}
        </DetailsListLayout>
    );
};

export default SubjectsPage;
