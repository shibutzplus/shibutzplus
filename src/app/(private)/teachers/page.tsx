"use client";

import React, { useState, useMemo } from "react";
import { NextPage } from "next";
import { TeacherType } from "@/models/types/teachers";
import TeachersForm from "@/components/TeachersForm/TeachersForm";
import TeachersList from "@/components/TeachersList/TeachersList";
import ManagementLayout from "@/components/layout/ManagementLayout/ManagementLayout";
import { useMainContext } from "@/context/MainContext";

const TeachersPage: NextPage = () => {
    const { teachers } = useMainContext();
    const [selectedTeacher, setSelectedTeacher] = useState<TeacherType | null>(null);

    const handleSelectTeacher = (teacher: TeacherType) => {
        setSelectedTeacher(teacher);
    };

    const listInfo = useMemo(() => {
        const homeroomTeachersCount = teachers?.filter((teacher) => teacher.role === "regular").length || 0;
        const substituteTeachersCount = teachers?.filter((teacher) => teacher.role === "substitute").length || 0;
        return `${homeroomTeachersCount} מורים מן המניין, ${substituteTeachersCount} מחליפים`;
    }, [teachers])

    return (
        <ManagementLayout
            formTitle="הוספת מורה"
            listTitle="מורים"
            listInfo={listInfo}
            children={[
                <TeachersList key="teachers-list" teachers={teachers || []} handleSelectTeacher={handleSelectTeacher} />,
                <TeachersForm key="teachers-form" selectedTeacher={selectedTeacher} />,
            ]}
        />
    );
};

export default TeachersPage;
