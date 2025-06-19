"use client";

import React, { useState } from "react";
import styles from "./teachers.module.css";
import { useSession } from "next-auth/react";
import { NextPage } from "next";
import { Teacher } from "@/models/types/teachers";
import TeachersForm from "@/components/TeachersForm/TeachersForm";
import TeachersList from "@/components/TeachersList/TeachersList";

// Sample data
const initialTeachers: Teacher[] = [
    {
        id: "1",
        name: "רחל",
        role: "מורה קיים",
        subject: "חשבון",
        classes: ["א1", "ב2", "ג1"],
    },
    {
        id: "2",
        name: "דוד",
        role: "מורה מחליף",
        subject: "עברית",
        classes: ["א2", "ב1"],
    },
    {
        id: "3",
        name: "יוסי",
        role: "מורה קיים",
        subject: "אנגלית",
        classes: ["ג1", "ג2", "ב3"],
    },
    {
        id: "4",
        name: "יוסי",
        role: "מורה קיים",
        subject: "אנגלית",
        classes: ["ג1", "ג2", "ב3"],
    },
    {
        id: "5",
        name: "יוסי",
        role: "מורה קיים",
        subject: "עברית",
        classes: ["ג1", "ג2", "ב3"],
    },
    {
        id: "6",
        name: "יוסי",
        role: "מורה קיים",
        subject: "ספורט",
        classes: ["ג1", "ג2", "ב3"],
    },
    {
        id: "7",
        name: "יוסי",
        role: "מורה קיים",
        subject: "אנגלית",
        classes: ["ג1", "ג2", "ב3"],
    },
    {
        id: "8",
        name: "יוסי",
        role: "מורה קיים",
        subject: "אנגלית",
        classes: ["ג1", "ג2", "ב3"],
    },
];

const TeachersPage: NextPage = () => {
    const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers);

    const { data: session, status } = useSession({
        required: true,
    });

    if (status === "loading") {
        return (
            <main className={styles.container}>
                <section className={styles.content}>
                    <h1>טוען...</h1>
                </section>
            </main>
        );
    }

    return (
        <main className={styles.container}>
            <TeachersList teachers={teachers} />
            <TeachersForm setTeachers={setTeachers} />
        </main>
    );
};

export default TeachersPage;
