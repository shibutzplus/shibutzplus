"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import InputSelect from "@/components/ui/InputSelect/InputSelect";
import { SelectOption } from "@/models/types";
import { getDayOptions, getTodayOption } from "@/resources/dayOptions";
import { getSubstituteTeachersAction } from "@/app/actions/GET/getSubstituteTeachersAction";
import { DailyScheduleType } from "@/models/types/dailySchedule";
import styles from "./teacherPortal.module.css";

const TeacherPortalPage = () => {
    const params = useParams();
    const teacherId = params.teacherId as string;
    
    const [selectedDay, setSelectedDay] = useState(getTodayOption());
    const [substitutes, setSubstitutes] = useState<DailyScheduleType[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>("");

    const dayOptions: SelectOption[] = getDayOptions();

    useEffect(() => {
        if (teacherId && selectedDay) {
            fetchSubstitutes();
        }
    }, [teacherId, selectedDay]);

    const fetchSubstitutes = async () => {
        setIsLoading(true);
        setError("");
        
        try {
            const response = await getSubstituteTeachersAction(teacherId, selectedDay);
            if (response.success && response.data) {
                setSubstitutes(response.data);
            } else {
                setError(response.message || "שגיאה בטעינת נתוני המחליפים");
                setSubstitutes([]);
            }
        } catch (error) {
            console.error("Error fetching substitutes:", error);
            setError("שגיאה בטעינת נתוני המחליפים");
            setSubstitutes([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDayChange = (value: string) => {
        setSelectedDay(value);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>פורטל המורה</h1>
                <p className={styles.subtitle}>מורים מחליפים ליום שנבחר</p>
                <div className={styles.navigation}>
                    <Link href="/daily-schedule-readonly" className={styles.navLink}>
                        צפייה במערכת השעות היומית
                    </Link>
                </div>
            </div>

            <div className={styles.controls}>
                <div className={styles.daySelector}>
                    <InputSelect
                        id="day-select"
                        label="בחר יום"
                        options={dayOptions}
                        value={selectedDay}
                        onChange={handleDayChange}
                        placeholder="בחר יום"
                        isSearchable={false}
                        error=""
                    />
                </div>
            </div>

            {error && (
                <div className={styles.error}>
                    {error}
                </div>
            )}

            {isLoading ? (
                <div className={styles.loading}>
                    טוען נתונים...
                </div>
            ) : (
                <div className={styles.tableContainer}>
                    {substitutes.length > 0 ? (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>שעה</th>
                                    <th>כיתה</th>
                                    <th>מקצוע</th>
                                    <th>מורה מחליף</th>
                                </tr>
                            </thead>
                            <tbody>
                                {substitutes.map((substitute) => (
                                    <tr key={substitute.id}>
                                        <td>{substitute.hour}</td>
                                        <td>{substitute.class?.name || ""}</td>
                                        <td>{substitute.subject?.name || ""}</td>
                                        <td>{substitute.subTeacher?.name || ""}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className={styles.noData}>
                            אין מורים מחליפים ליום שנבחר
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TeacherPortalPage;
