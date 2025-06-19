"use client";

import React, { useState, useMemo } from "react";
import { NextPage } from "next";
import { Teacher } from "@/models/types/teachers";
import TeachersForm from "@/components/TeachersForm/TeachersForm";
import TeachersList from "@/components/TeachersList/TeachersList";
import ManagementLayout from "@/components/layout/ManagementLayout/ManagementLayout";

// Sample data
const initialTeachers: Teacher[] = [
    {
        id: "1",
        name: "רחל",
        role: "מורה קיים",
        primaryClass: "א1",
    },
    {
        id: "2",
        name: "דוד",
        role: "מורה מחליף",
        primaryClass: "א2",
    },
    {
        id: "3",
        name: "יוסי",
        role: "מורה קיים",
        primaryClass: "ג1",
    },
    {
        id: "4",
        name: "יוסי",
        role: "מורה קיים",
        primaryClass: "ג1",
    },
    {
        id: "5",
        name: "יוסי",
        role: "מורה קיים",
        primaryClass: "ג1",
    },
    {
        id: "6",
        name: "יוסי",
        role: "מורה קיים",
        primaryClass: "ג1",
    },
    {
        id: "7",
        name: "יוסי",
        role: "מורה קיים",
        primaryClass: "ג1",
    },
    {
        id: "8",
        name: "יוסי",
        role: "מורה קיים",
        primaryClass: "ג1",
    },
];

const TeachersPage: NextPage = () => {
    const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers);
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

    const handleSelectTeacher = (teacher: Teacher) => {
        setSelectedTeacher(teacher);
    };

    const listInfo = useMemo(() => {
        const fixedTeachersCount = teachers.filter((teacher) => teacher.role === "מורה קיים").length;
        const substituteTeachersCount = teachers.filter((teacher) => teacher.role === "מורה מחליף").length;
        return `${fixedTeachersCount} קבועים, ${substituteTeachersCount} מחליפים`;
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
