"use client";

import React, { useState, useMemo } from "react";
import { NextPage } from "next";
import { SubjectType } from "@/models/types/subjects";
import SubjectsForm from "@/components/SubjectsForm/SubjectsForm";
import SubjectsList from "@/components/SubjectsList/SubjectsList";
import ManagementLayout from "@/components/layout/ManagementLayout/ManagementLayout";
import { useMainContext } from "@/context/MainContext";

const SubjectsPage: NextPage = () => {
    const { subjects } = useMainContext();
    const [selectedSubject, setSelectedSubject] = useState<SubjectType | null>(null);

    const handleSelectSubject = (subject: SubjectType) => {
        setSelectedSubject(subject);
    };

    const listInfo = useMemo(() => {
        return `${subjects?.length || 0} מקצועות`;
    }, [subjects]);

    return (
        <ManagementLayout
            formTitle="הוספת מקצוע"
            listTitle="רשימת מקצועות"
            listInfo={listInfo}
            children={[
                <SubjectsList
                    key="subjects-list"
                    subjects={subjects || []}
                    handleSelectSubject={handleSelectSubject}
                />,
                <SubjectsForm key="subjects-form" selectedSubject={selectedSubject} />,
            ]}
        />
    );
};

export default SubjectsPage;
