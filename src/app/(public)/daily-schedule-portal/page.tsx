"use client";

import React, { useEffect, useState } from "react";
import styles from "./dailySchedulePortal.module.css";
import ReadOnlyDailyTable from "@/components/readOnlyDailyTable/ReadOnlyDailyTable/ReadOnlyDailyTable";
import { DailyScheduleType } from "@/models/types/dailySchedule";
import { usePortal } from "@/context/PortalContext";
import { errorToast } from "@/lib/toast";
import messages from "@/resources/messages";
import { getDailyScheduleAction } from "@/app/actions/GET/getDailyScheduleAction";
import { getSchoolCookie } from "@/lib/cookies";

const DailySchedulePortalPage = () => {
    const { selectedDate } = usePortal();
    const [currentDateData, setCurrentDateData] = useState<DailyScheduleType[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchDailyScheduleData = async (date: string) => {
        const schoolId = getSchoolCookie();
        if (!date || !schoolId) return;

        setIsLoading(true);
        try {
            const response = await getDailyScheduleAction(schoolId, date);
            if (response.success && response.data) {
                setCurrentDateData(response.data);
            } else {
                errorToast(response.message || messages.dailySchedule.error);
                setCurrentDateData([]);
            }
        } catch (error) {
            console.error("Error fetching daily schedule:", error);
            errorToast(messages.dailySchedule.error);
            setCurrentDateData([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (selectedDate) {
            fetchDailyScheduleData(selectedDate);
        } else {
            setCurrentDateData([]);
        }
    }, [selectedDate]);

    return (
        <div className={styles.content}>
            <div className={styles.tableWrapper}>
                <ReadOnlyDailyTable scheduleData={currentDateData} isLoading={isLoading} />
            </div>
        </div>
    );
};

export default DailySchedulePortalPage;
