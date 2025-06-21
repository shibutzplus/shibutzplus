"use client";

import React, { useState, useMemo } from "react";
import { NextPage } from "next";
import { TeacherType } from "@/models/types/teachers";
import TeachersForm from "@/components/TeachersForm/TeachersForm";
import TeachersList from "@/components/TeachersList/TeachersList";
import ManagementLayout from "@/components/layout/ManagementLayout/ManagementLayout";

const TeachersPage: NextPage = () => {
    const [teachers, setTeachers] = useState<TeacherType[]>([]);
    const [selectedTeacher, setSelectedTeacher] = useState<TeacherType | null>(null);

    const handleSelectTeacher = (teacher: TeacherType) => {
        setSelectedTeacher(teacher);
    };

    const listInfo = useMemo(() => {
        const homeroomTeachersCount = teachers.filter((teacher) => teacher.role === "homeroom").length;
        const substituteTeachersCount = teachers.filter((teacher) => teacher.role === "substitute").length;
        return `${homeroomTeachersCount} מחנכים, ${substituteTeachersCount} מחליפים`;
    }, [teachers])

    return (
        <ManagementLayout
            formTitle="הוספת מורה"
            listTitle="רשימת מורים"
            listInfo={listInfo}
            children={[
                <TeachersList teachers={teachers} handleSelectTeacher={handleSelectTeacher} />,
                <TeachersForm setTeachers={setTeachers} selectedTeacher={selectedTeacher} />,
            ]}
        />
    );
};

export default TeachersPage;
