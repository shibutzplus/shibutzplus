"use client";

import React from "react";
import { NextPage } from "next";
import { usePortalContext } from "@/context/PortalContext";
import { useParams, useRouter } from "next/navigation";
import Preloader from "@/components/ui/Preloader/Preloader";
import AnnualAltTeacherPortalTable from "@/components/tables/annualAltTeacherPortalTable/AnnualAltTeacherPortalTable";
import { getTeacherAltPortalDataAction } from "@/app/actions/GET/getTeacherAltPortalDataAction";
import { setStorageTeacher } from "@/lib/localStorage";
import { TeacherRoleValues } from "@/models/types/teachers";
import router from "@/routes";
import styles from "./teacherAltPortal.module.css";
import { useTeacherAltTableContext } from "@/context/TeacherAltTableContext";

const TeacherAltPortalPage: NextPage = () => {
    const { selectedDate, teacher, settings, hydratePortalData } = usePortalContext();
    const { fetchTeacherAltSchedule, hydrateSchedule } = useTeacherAltTableContext();
    const params = useParams();
    const route = useRouter();
    const schoolId = params.schoolId as string | undefined;
    const teacherId = params.teacherId as string | undefined;
    const initialized = React.useRef(false);
    const hasInitialHydrated = React.useRef(false);

    // Redirect substitute teachers
    React.useEffect(() => {
        if (teacher && teacher.role === TeacherRoleValues.SUBSTITUTE) {
            route.push(`${router.teacherMaterialPortal.p}/${schoolId}/${teacherId}`);
        }
    }, [teacher]);

    React.useEffect(() => {
        if (!schoolId || !teacherId) return;
        if (initialized.current) return;

        const initPortal = async () => {
            initialized.current = true;

            const data = await getTeacherAltPortalDataAction(schoolId, teacherId);

            if (!data.success || !data.teacher || !data.settings || !data.datesOptions || !data.selectedDate) {
                route.push(`${router.teacherSignIn.p}/${schoolId}`);
                return;
            }

            const { teacher, settings, datesOptions, selectedDate, scheduleData } = data;

            // Redirect substitute teachers immediately
            if (teacher.role === TeacherRoleValues.SUBSTITUTE) {
                route.push(`${router.teacherMaterialPortal.p}/${schoolId}/${teacherId}`);
                return;
            }

            hydratePortalData(teacher, schoolId, settings, datesOptions, selectedDate);
            setStorageTeacher(teacher);

            // Hydrate the alt annual schedule from the initial payload
            if (scheduleData && scheduleData.success && scheduleData.data) {
                const next: Record<string, any> = {};
                next[selectedDate] = {};
                for (const entry of scheduleData.data) {
                    next[selectedDate][String(entry.hour)] = {
                        DBid: entry.id,
                        columnId: entry.columnId,
                        hour: entry.hour,
                        schoolId: entry.school?.id,
                        school: entry.school,
                        classes: entry.classes,
                        subject: entry.subject,
                        isRegular: false,
                    };
                }
                hydrateSchedule(next, selectedDate);
            }

            hasInitialHydrated.current = true;
        };

        initPortal();
    }, [schoolId, teacherId]);

    React.useEffect(() => {
        if (teacher && selectedDate && schoolId) {
            // Skip fetching if we just hydrated this exact date from the initial load
            if (hasInitialHydrated.current) {
                hasInitialHydrated.current = false;
                return;
            }
            fetchTeacherAltSchedule(teacher, selectedDate, schoolId);
        }
    }, [selectedDate]);

    if (!teacher || !settings) {
        return (
            <div style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%, -50%)" }}>
                <Preloader />
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <AnnualAltTeacherPortalTable
                selectedDate={selectedDate}
                fromHour={settings?.fromHour}
                toHour={settings?.toHour}
            />
        </div>
    );
};

export default TeacherAltPortalPage;
