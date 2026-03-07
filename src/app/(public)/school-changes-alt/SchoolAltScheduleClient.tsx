"use client";

import React, { useEffect, useState } from "react";
import { usePortalContext } from "@/context/PortalContext";
import { ClassType } from "@/models/types/classes";
import TeacherDailyAltSchoolTable from "@/components/tables/teacherDailyAltSchool/TeacherDailyAltSchoolTable";
import { WeeklySchedule } from "@/models/types/annualSchedule";
import { getAnnualAltAction } from "@/app/actions/GET/getAnnualAltAction";
import Preloader from "@/components/ui/Preloader/Preloader";
import styles from "./schoolAltSchedule.module.css";
import { populateAllClassesSchedule } from "@/services/annual/populate";
import { initializeEmptyAnnualSchedule } from "@/services/annual/initialize";
import { getDayNameByDateString, getDayNumberByDateString } from "@/utils/time";
import NotPublished from "@/components/empty/NotPublished/NotPublished";

export default function SchoolAltScheduleClient() {
    const { settings, selectedDate, schoolId, datesOptions = [], teachers = [], classes = [], subjects = [] } = usePortalContext();
    const [schedule, setSchedule] = useState<WeeklySchedule>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!schoolId || !settings || classes.length === 0 || teachers.length === 0 || subjects.length === 0) return;

            setIsLoading(true);
            try {
                // Fetch ONLY the annual alternative schedule (entities are from context)
                const scheduleRes = await getAnnualAltAction(schoolId);

                if (scheduleRes.success && scheduleRes.data) {
                    let newSchedule = {};
                    classes.forEach((c: ClassType) => {
                        newSchedule = initializeEmptyAnnualSchedule(
                            newSchedule,
                            c.id,
                            settings.fromHour ?? 1,
                            settings.toHour ?? 10
                        );
                    });

                    newSchedule = populateAllClassesSchedule(scheduleRes.data, newSchedule);
                    setSchedule(newSchedule);
                }
            } catch (error) {
                console.error("Failed to fetch alt schedule data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [schoolId, settings, classes, teachers, subjects]);

    if (!settings || isLoading) {
        return (
            <div className={styles.loadingContainer}>
                <Preloader />
            </div>
        );
    }

    const isShabbat = selectedDate ? getDayNumberByDateString(selectedDate) === 7 : false;

    if (isShabbat) {
        return (
            <section className={styles.container}>
                <NotPublished date={selectedDate} text="סוף שבוע נעים" />
            </section>
        );
    }

    if (!selectedDate) {
        return <div className={styles.loading}>לא נבחר תאריך למערכת.</div>;
    }

    return (
        <section className={styles.container}>
            {classes && classes.length > 0 ? (
                <TeacherDailyAltSchoolTable
                    schedule={schedule}
                    selectedDay={getDayNameByDateString(selectedDate)}
                    subjects={subjects}
                    teachers={teachers}
                    classes={classes}
                    fromHour={settings.fromHour ?? 1}
                    toHour={settings.toHour ?? 10}
                />
            ) : (
                <div className={styles.emptyState}>אין כיתות להצגה</div>
            )}
        </section>
    );
}

