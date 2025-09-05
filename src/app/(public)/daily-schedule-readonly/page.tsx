"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getDailyScheduleAction } from "@/app/actions/GET/getDailyScheduleAction";
import { DailyScheduleType } from "@/models/types/dailySchedule";
import { useMainContext } from "@/context/MainContext";
import styles from "./page.module.css";
import router from "@/routes";
import { getToday } from "@/utils/time";
import ReadOnlyDailyTable from "@/components/readOnlyDailyTable/ReadOnlyDailyTable/ReadOnlyDailyTable";

const DailyScheduleReadOnlyPage = () => {
    const { school } = useMainContext();
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [scheduleData, setScheduleData] = useState<DailyScheduleType[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>("");

    // Set default date to today
    useEffect(() => {
        setSelectedDate(getToday());
    }, []);

    // Fetch schedule data when date or school changes
    useEffect(() => {
        if (selectedDate && school?.id) {
            fetchScheduleData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDate, school?.id]);

    const fetchScheduleData = async () => {
        if (!school?.id || !selectedDate) return;

        setLoading(true);
        setError("");

        try {
            const response = await getDailyScheduleAction(school.id, selectedDate);
            if (response.success && response.data) {
                setScheduleData(response.data);
            } else {
                setError(response.message || "שגיאה בטעינת נתוני המערכת");
                setScheduleData([]);
            }
        } catch {
            setError("שגיאה בטעינת נתוני המערכת");
            setScheduleData([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedDate(e.target.value);
    };

    if (!school) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>אין מידע על בית הספר אנא התחבר מחדש</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>מערכת שעות יומית - תצוגה</h1>
                <p className={styles.schoolName}>{school.name}</p>
                <div className={styles.navigation}>
                    <Link href={router.teacherPortal.p} className={styles.navLink}>
                        פורטל המורים
                    </Link>
                </div>
            </div>

            <div className={styles.controls}>
                <div className={styles.dateSelector}>
                    <label htmlFor="date" className={styles.dateLabel}>
                        בחר תאריך
                    </label>
                    <input
                        type="date"
                        id="date"
                        value={selectedDate}
                        onChange={handleDateChange}
                        className={styles.dateInput}
                    />
                </div>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            {loading ? (
                <div className={styles.loading}>טוען נתונים</div>
            ) : scheduleData && scheduleData.length > 0 ? (
                <ReadOnlyDailyTable scheduleData={scheduleData} />
            ) : (
                <div className={styles.empty}>אין נתונים להצגה לתאריך שנבחר</div>
            )}
        </div>
    );
};

export default DailyScheduleReadOnlyPage;
