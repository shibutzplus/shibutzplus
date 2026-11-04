"use client";

import React, { useEffect } from "react";
import router from "@/routes";
import { NextPage } from "next";
import { usePortalContext } from "@/context/PortalContext";
import { useTeacherTableContext } from "@/context/TeacherTableContext";
import { useParams, useRouter } from "next/navigation";
import TeacherDailyChangesTable from "@/components/tables/teacherDailyChanges/TeacherDailyChangesTable/TeacherDailyChangesTable";
import Preloader from "@/components/ui/Preloader/Preloader";
import NotPublished from "@/components/empty/NotPublished/NotPublished";
import { getDayNumberByDateString } from "@/utils/time";
import { getTeacherPortalDataAction } from "@/app/actions/GET/getTeacherPortalDataAction";
import { populatePortalTable } from "@/services/portalTeacherService";
import { setStorageTeacher, removeStorageTeacher } from "@/lib/localStorage";
import styles from "./teacherPortal.module.css";

export const runtime = 'edge';

const TeacherPortalPage: NextPage = () => {
    const { selectedDate, teacher, datesOptions, settings, hydratePortalData } = usePortalContext();
    const { fetchTeacherScheduleDate, hydrateSchedule } = useTeacherTableContext();
    const params = useParams();
    const route = useRouter();
    const schoolId = params.schoolId as string | undefined;
    const teacherId = params.teacherId as string | undefined;
    const initialized = React.useRef(false);
    const hydratedDateRef = React.useRef<string | null>(null);

    useEffect(() => {
        if (!schoolId || !teacherId) return;
        if (initialized.current) return;

        const initPortal = async () => {
            initialized.current = true;

            const data = await getTeacherPortalDataAction(schoolId, teacherId);

            if (!data.success || !data.teacher || !data.settings || !data.datesOptions || !data.selectedDate) {
                removeStorageTeacher();
                route.push(`${router.teacherSignIn.p}/${schoolId}`);
                return;
            }

            const { teacher, settings, datesOptions, selectedDate: initialDate, scheduleData, allTeachers, allSubjects, allClasses, hasUnpublishedFutureAbsences } = data;

            // Mark the date whose schedule arrives with the initial data, so the selectedDate effect below won't fetch it again
            if (scheduleData?.success && scheduleData.data) hydratedDateRef.current = initialDate;

            // 1. Hydrate Portal Context (Teacher, School, Settings, Dates, Lists)
            hydratePortalData(
                teacher,
                schoolId,
                settings,
                datesOptions,
                initialDate,
                allTeachers,
                allSubjects,
                allClasses,
                hasUnpublishedFutureAbsences ?? false
            );

            // Persist teacher data to local storage for other pages (e.g. FAQ)
            setStorageTeacher(teacher);


            // 2. Hydrate Schedule Context if available
            if (scheduleData && scheduleData.success && scheduleData.data) {
                const scheduleMap = populatePortalTable(scheduleData.data, {}, initialDate, teacher.id);
                if (scheduleMap) {
                    hydrateSchedule(scheduleMap, initialDate);
                    // If PortalContext kept a previously selected date (from client navigation) that differs from the server's default date, fetch its schedule
                    if (selectedDate && selectedDate !== initialDate && datesOptions.some(o => o.value === selectedDate)) {
                        hydratedDateRef.current = null;
                        fetchTeacherScheduleDate(teacher, selectedDate);
                    }
                }
            }
        };

        initPortal();

    }, [schoolId, teacherId]);

    const isFirstRun = React.useRef(true);
    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }
        // Skip once if this date's schedule was already hydrated from getTeacherPortalDataAction (avoid duplicate fetch on load)
        const hydratedDate = hydratedDateRef.current;
        hydratedDateRef.current = null;
        if (hydratedDate && hydratedDate === selectedDate) return;
        if (teacher && selectedDate) {
            fetchTeacherScheduleDate(teacher, selectedDate);
        }
    }, [selectedDate]);

    if (!teacher || !settings)
        return (
            <div
                style={{
                    position: "absolute",
                    top: "40%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                }}
            >
                <Preloader />
            </div>
        );

    const isPublished = datesOptions.some((d) => d.value === selectedDate);
    const isShabbat = selectedDate ? getDayNumberByDateString(selectedDate) === 7 : false;

    if (!isPublished) {
        return <NotPublished date={selectedDate} text={isShabbat ? "סוף שבוע נעים" : "אין עדכונים, מערכת לא פורסמה"} displayButton={false} />;
    }

    return (
        <div className={styles.container}>
            <TeacherDailyChangesTable
                teacher={teacher}
                selectedDate={selectedDate}
                fromHour={settings?.fromHour}
                toHour={settings?.toHour}
            />
        </div>
    );
};

export default TeacherPortalPage;
