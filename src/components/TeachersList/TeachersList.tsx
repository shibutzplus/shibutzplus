import React from "react";
import styles from "./TeachersList.module.css";
import { Teacher } from "@/models/types/teachers";

type TeachersListProps = {
    teachers: Teacher[];
};

const TeachersList: React.FC<TeachersListProps> = ({ teachers }) => {
    const displayRole = (role: string): React.ReactNode => {
        switch (role) {
            case "מורה קיים":
                return <td className={styles.roleCellGreen}>קבוע</td>;
            case "מורה מחליף":
                return <td className={styles.roleCellBlue}>מחליף</td>;
            default:
                return <td className={styles.roleCell}>-</td>;
        }
    };

    return (
        <section className={styles.teachersListSection}>
            <h1 className={styles.title}>רשימת מורים</h1>
            <div className={styles.teachersCount}>
                {teachers.length} מורים | 5 קבועים, 3 מחליפים
            </div>
            <section className={styles.teachersTableSection}>
                <table className={styles.teachersList}>
                    <thead>
                        <tr>
                            <th>שם מלא</th>
                            <th>תפקיד</th>
                            <th>מקצוע</th>
                            <th>כיתות</th>
                            <th>פעולות</th>
                        </tr>
                    </thead>
                    <tbody>
                        {teachers.map((teacher) => (
                            <tr key={teacher.id}>
                                <td>{teacher.name}</td>
                                <td>{displayRole(teacher.role)}</td>
                                <td>{teacher.subject || "-"}</td>
                                <td>{teacher.classes.join(", ")}</td>
                                <td>
                                    <div className={styles.actionButtons}>
                                        <button className={styles.editButton} aria-label="ערוך">
                                            <span className={styles.editIcon}>✏️</span>
                                        </button>
                                        <button className={styles.deleteButton} aria-label="מחק">
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
    );
};

export default TeachersList;
