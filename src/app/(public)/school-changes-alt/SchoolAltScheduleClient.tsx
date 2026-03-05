"use client";

import React, { useEffect, useState } from "react";
import { usePortalContext } from "@/context/PortalContext";
import { ClassType } from "@/models/types/classes";
import { TeacherType } from "@/models/types/teachers";
import { SubjectType } from "@/models/types/subjects";
import TeacherDailyAltSchoolTable from "@/components/tables/teacherDailyAltSchool/TeacherDailyAltSchoolTable";
import { WeeklySchedule } from "@/models/types/annualSchedule";
import { getAnnualAltAction } from "@/app/actions/GET/getAnnualAltAction";
import Preloader from "@/components/ui/Preloader/Preloader";
import styles from "./schoolAltSchedule.module.css";
import { populateAllClassesSchedule } from "@/services/annual/populate";
import { initializeEmptyAnnualSchedule } from "@/services/annual/initialize";
import { getClassesAction } from "@/app/actions/GET/getClassesAction";
import { getTeachersAction } from "@/app/actions/GET/getTeachersAction";
import { getSubjectsAction } from "@/app/actions/GET/getSubjectsAction";
import { PortalType } from "@/models/types";
import { getDayNameByDateString } from "@/utils/time";

export default function SchoolAltScheduleClient() {
    const { settings, selectedDate, schoolId } = usePortalContext();
    const [schedule, setSchedule] = useState<WeeklySchedule>({});
    const [classes, setClasses] = useState<ClassType[]>([]);
    const [teachers, setTeachers] = useState<TeacherType[]>([]);
    const [subjects, setSubjects] = useState<SubjectType[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!schoolId || !selectedDate || !settings) return;

            setIsLoading(true);
            try {
                // Fetch basic entities
                const [classesRes, teachersRes, subjectsRes, scheduleRes] = await Promise.all([
                    getClassesAction(schoolId, { portalType: PortalType.Teacher }),
                    getTeachersAction(schoolId, { portalType: PortalType.Teacher, includeSubstitutes: true }),
                    getSubjectsAction(schoolId, { portalType: PortalType.Teacher }),
                    getAnnualAltAction(schoolId)
                ]);

                if (classesRes.success && classesRes.data) setClasses(classesRes.data);
                if (teachersRes.success && teachersRes.data) setTeachers(teachersRes.data);
                if (subjectsRes.success && subjectsRes.data) setSubjects(subjectsRes.data);

                if (scheduleRes.success && scheduleRes.data && classesRes.data) {
                    let newSchedule = {};
                    classesRes.data.forEach((c: ClassType) => {
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
    }, [schoolId, selectedDate, settings]);

    if (!settings || isLoading) {
        return (
            <div className={styles.loadingContainer}>
                <Preloader />
            </div>
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

