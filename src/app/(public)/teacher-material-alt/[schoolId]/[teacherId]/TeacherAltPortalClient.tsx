"use client";

import React from "react";
import { usePortalContext } from "@/context/PortalContext";
import { useTeacherAltTableContext } from "@/context/TeacherAltTableContext";
import { TeacherType } from "@/models/types/teachers";
import { SchoolSettingsType } from "@/models/types/settings";
import { SelectOption } from "@/models/types";
import { GetDailyScheduleResponse } from "@/models/types/dailySchedule";
import { setStorageTeacher } from "@/lib/localStorage";
import AnnualAltTeacherPortalTable from "@/components/tables/annualAltTeacherPortalTable/AnnualAltTeacherPortalTable";
import styles from "./teacherAltPortal.module.css";

interface TeacherAltPortalClientProps {
    teacher: TeacherType;
    schoolId: string;
    settings: SchoolSettingsType;
    datesOptions: SelectOption[];
    selectedDate: string;
    scheduleData?: GetDailyScheduleResponse;
}

const TeacherAltPortalClient: React.FC<TeacherAltPortalClientProps> = ({
    teacher,
    schoolId,
    settings,
    datesOptions,
    selectedDate,
    scheduleData,
}) => {
    const { hydratePortalData } = usePortalContext();
    const { hydrateSchedule } = useTeacherAltTableContext();
    const initialized = React.useRef(false);

    React.useEffect(() => {
        if (!initialized.current) {
            hydratePortalData(teacher, schoolId, settings, datesOptions, selectedDate);
            setStorageTeacher(teacher);

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
            initialized.current = true;
        }
    }, [teacher, schoolId, settings, datesOptions, selectedDate, scheduleData]);

    return (
        <div className={styles.container}>
            <AnnualAltTeacherPortalTable
                selectedDate={selectedDate}
                fromHour={settings.fromHour}
                toHour={settings.toHour}
            />
        </div>
    );
};

export default TeacherAltPortalClient;
