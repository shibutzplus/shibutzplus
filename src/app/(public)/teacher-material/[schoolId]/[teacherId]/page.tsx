"use client";

import React, { useEffect } from "react";
import router from "@/routes";
import { NextPage } from "next";
import { usePortalContext } from "@/context/PortalContext";
import { useTeacherTableContext } from "@/context/TeacherTableContext";
import { useParams, useRouter } from "next/navigation";
import TeacherTable from "@/components/tables/teacherMaterialTable/TeacherTable/TeacherTable";
import Preloader from "@/components/ui/Preloader/Preloader";
import NotPublished from "@/components/empty/NotPublished/NotPublished";
import { getDayNumberByDateString } from "@/utils/time";
import { getTeacherPortalDataAction } from "@/app/actions/GET/getTeacherPortalDataAction";
import { populatePortalTable } from "@/services/portalTeacherService";
import { setStorageTeacher } from "@/lib/localStorage";
import styles from "./teacherPortal.module.css";
import { TeacherRoleValues } from "@/models/types/teachers";

const TeacherPortalPage: NextPage = () => {

    const { selectedDate, teacher, datesOptions, settings, hydratePortalData } = usePortalContext();
    const { fetchTeacherScheduleDate, hydrateSchedule } = useTeacherTableContext();
    const params = useParams();
    const route = useRouter();
    const schoolId = params.schoolId as string | undefined;
    const teacherId = params.teacherId as string | undefined;
    const initialized = React.useRef(false);

    useEffect(() => {
        if (!schoolId || !teacherId) return;
        if (initialized.current) return;

        const initPortal = async () => {
            initialized.current = true;

            const data = await getTeacherPortalDataAction(schoolId, teacherId);

            if (!data.success || !data.teacher || !data.settings || !data.datesOptions || !data.selectedDate) {
                route.push(`${router.teacherSignIn.p}/${schoolId}`);
                return;
            }

            const { teacher, settings, datesOptions, selectedDate, scheduleData, allTeachers, allSubjects, allClasses } = data;

            // 1. Hydrate Portal Context (Teacher, School, Settings, Dates, Lists)
            hydratePortalData(
                teacher,
                schoolId,
                settings,
                datesOptions,
                selectedDate,
                allTeachers,
                allSubjects,
                allClasses
            );

            // Persist teacher data to local storage for other pages (e.g. FAQ)
            setStorageTeacher(teacher);


            // 2. Hydrate Schedule Context if available
            if (scheduleData && scheduleData.success && scheduleData.data) {
                const scheduleMap = populatePortalTable(scheduleData.data, {}, selectedDate);
                if (scheduleMap) {
                    hydrateSchedule(scheduleMap, selectedDate);
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
        return <NotPublished date={selectedDate} text={isShabbat ? "סוף שבוע נעים" : "המערכת לא פורסמה"} displayButton={false} />;
    }

    return (
        <div className={styles.container}>
            <TeacherTable
                teacher={teacher}
                selectedDate={selectedDate}
                hoursNum={settings?.hoursNum}
            />
        </div>
    );
};

export default TeacherPortalPage;
