"use client";

import React, { useState, useMemo } from "react";
import { NextPage } from "next";
import { SubjectType } from "@/models/types/subjects";
import SubjectsForm from "@/components/SubjectsForm/SubjectsForm";
import SubjectsList from "@/components/SubjectsList/SubjectsList";
import ManagementLayout from "@/components/layout/ManagementLayout/ManagementLayout";

const SubjectsPage: NextPage = () => {
    const [subjects, setSubjects] = useState<SubjectType[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<SubjectType | null>(null);

    const handleSelectSubject = (subject: SubjectType) => {
        setSelectedSubject(subject);
    };

    const listInfo = useMemo(() => {
        return `${subjects.length} מקצועות`;
    }, [subjects]);

    return (
        <ManagementLayout
            formTitle="הוספת מקצוע"
            listTitle="רשימת מקצועות"
            listInfo={listInfo}
            children={[
                <SubjectsList subjects={subjects} handleSelectSubject={handleSelectSubject} />,
                <SubjectsForm setSubjects={setSubjects} selectedSubject={selectedSubject} />,
            ]}
        />
    );
};

export default SubjectsPage;
