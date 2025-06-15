"use client";

import React, { useState } from "react";
import styles from "./teachers.module.css";
import { useSession } from "next-auth/react";
import { NextPage } from "next";
import { Teacher } from "@/models/types/teachers";
import TeachersForm from "@/components/TeachersForm/TeachersForm";

// Sample data
const initialTeachers: Teacher[] = [
    {
        id: "1",
        firstName: "רחל",
        lastName: "כהן",
        role: "מורה קיים",
        classes: ["א1", "ב2", "ג1"],
    },
    {
        id: "2",
        firstName: "דוד",
        lastName: "לוי",
        role: "מורה מחליף",
        classes: ["א2", "ב1"],
    },
    {
        id: "3",
        firstName: "יוסי",
        lastName: "גרין",
        role: "מורה קיים",
        classes: ["ג1", "ג2", "ב3"],
    },
    {
        id: "4",
        firstName: "יוסי",
        lastName: "גרין",
        role: "מורה קיים",
        classes: ["ג1", "ג2", "ב3"],
    },
    {
        id: "5",
        firstName: "יוסי",
        lastName: "גרין",
        role: "מורה קיים",
        classes: ["ג1", "ג2", "ב3"],
    },
    {
        id: "6",
        firstName: "יוסי",
        lastName: "גרין",
        role: "מורה קיים",
        classes: ["ג1", "ג2", "ב3"],
    },
    {
        id: "7",
        firstName: "יוסי",
        lastName: "גרין",
        role: "מורה קיים",
        classes: ["ג1", "ג2", "ב3"],
    },
    {
        id: "8",
        firstName: "יוסי",
        lastName: "גרין",
        role: "מורה קיים",
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
            <TeachersForm setTeachers={setTeachers} />
            <section className={styles.teachersListSection}>
                <h1 className={styles.title}>רשימת מורים</h1>
                <div className={styles.teachersCount}>{teachers.length} מורים</div>
                <section className={styles.teachersTableSection}>
                    <table className={styles.teachersList}>
                        <thead>
                            <tr>
                                <th>שם מלא</th>
                                <th>תפקיד</th>
                                <th>כיתות</th>
                                <th>פעולות</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teachers.map((teacher) => (
                                <tr key={teacher.id}>
                                    <td>
                                        {teacher.firstName} {teacher.lastName}
                                    </td>
                                    <td>{teacher.role}</td>
                                    <td>{teacher.classes.join(", ")}</td>
                                    <td>
                                        <div className={styles.actionButtons}>
                                            <button className={styles.editButton} aria-label="ערוך">
                                                <span className={styles.editIcon}>✏️</span>
                                            </button>
                                            <button
                                                className={styles.deleteButton}
                                                aria-label="מחק"
                                            >
                                                <span className={styles.deleteIcon}>🗑️</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            </section>
        </main>
    );
};

export default TeachersPage;
