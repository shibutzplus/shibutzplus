"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./PublishedPortal.module.css";
import { DailyScheduleType } from "@/models/types/dailySchedule";
import { usePortal } from "@/context/PortalContext";
import { errorToast } from "@/lib/toast";
import messages from "@/resources/messages";
import { getDailyScheduleAction } from "@/app/actions/GET/getDailyScheduleAction";
import { getSchoolCookie } from "@/lib/cookies";
import ViewTable from "@/components/viewTable/ViewTable/ViewTable";
import PublishedSkeleton from "@/components/layout/skeleton/PublishedSkeleton/PublishedSkeleton";
import { NextPage } from "next";

const PublishedPortalPage: NextPage = () => {
    const { selectedDate } = usePortal();
    const [currentDateData, setCurrentDateData] = useState<DailyScheduleType[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchDailyScheduleData = async () => {
        const schoolId = getSchoolCookie();
        if (!schoolId || !selectedDate || currentDateData.length > 0) return;
        try {
            setIsLoading(true);
            const response = await getDailyScheduleAction(schoolId, selectedDate, {
                isPrivate: false,
            });
            if (response.success && response.data) {
                setCurrentDateData(response.data);
                blockRef.current = false;
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

    const blockRef = useRef<boolean>(true);
    useEffect(() => {
        if (blockRef.current) {
            fetchDailyScheduleData();
        }
    }, [selectedDate]);

    if (isLoading) return <PublishedSkeleton />;

    return (
        <div className={styles.content}>
            <div className={styles.tableWrapper}>
                <ViewTable
                    scheduleData={currentDateData}
                    noScheduleTitle="אין נתונים להצגה"
                    noScheduleSubTitle={["לא פורסמה מערכת"]}
                    hasMobileNav
                />
            </div>
        </div>
    );
};

export default PublishedPortalPage;
