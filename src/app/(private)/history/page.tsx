"use client";

import React, { useEffect, useRef, useState } from "react";
import type { NextPage } from "next";
import styles from "./history.module.css";
import ViewTable from "@/components/tables/viewTable/ViewTable/ViewTable";
import { useMainContext } from "@/context/MainContext";
import { getDailyScheduleAction } from "@/app/actions/GET/getDailyScheduleAction";
import { DailyScheduleType } from "@/models/types/dailySchedule";
import { errorToast } from "@/lib/toast";
import messages from "@/resources/messages";
import { useQueryParam } from "@/hooks/useQueryParam";

const HistorySchedulePage: NextPage = () => {
    const { school } = useMainContext();
    const { getDateQ } = useQueryParam();

    const dateFromQuery = getDateQ();

    const [currentDateData, setCurrentDateData] = useState<DailyScheduleType[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchDailyScheduleData = async () => {
        if (!school?.id || !dateFromQuery) {
            setCurrentDateData([]);
            return;
        }

        try {
            setIsLoading(true);
            const response = await getDailyScheduleAction(school.id, dateFromQuery, {
                isPrivate: false,
            });
            if (response.success && response.data) {
                setCurrentDateData(response.data);
            } else {
                setCurrentDateData([]);
                errorToast(response.message || messages.dailySchedule.error);
            }
        } catch (error) {
            console.error("Error fetching daily schedule:", error);
            setCurrentDateData([]);
            errorToast(messages.dailySchedule.error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDailyScheduleData();
    }, [dateFromQuery]);

    return (
        <div className={styles.content}>
            <ViewTable
                scheduleData={currentDateData}
                noScheduleTitle="אין נתונים להצגה"
                noScheduleSubTitle="לא פורסמה מערכת עבור יום זה"
                isManager={true}
            />
        </div>
    );
};

export default HistorySchedulePage;
