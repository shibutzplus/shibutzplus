"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./history.module.css";
import { getDailyScheduleAction } from "@/app/actions/GET/getDailyScheduleAction";
import { DailyScheduleType } from "@/models/types/dailySchedule";
import { useMainContext } from "@/context/MainContext";
import { errorToast } from "@/lib/toast";
import messages from "@/resources/messages";
import { useHistoryTable } from "@/context/HistoryTableContext";
import ViewTable from "@/components/viewTable/ViewTable/ViewTable";
import { useSearchParams } from "next/navigation";
import PublishedSkeleton from "@/components/layout/skeleton/PublishedSkeleton/PublishedSkeleton";
import { NextPage } from "next";

const HistorySchedulePage: NextPage = () => {
    const { school } = useMainContext();
    const { selectedYearDate } = useHistoryTable();
    const searchParams = useSearchParams();
    const dateFromQuery = searchParams.get("date");

    const [prevSelectedDate, setPrevSelectedDate] = useState<string>(selectedYearDate);
    const [currentDateData, setCurrentDateData] = useState<DailyScheduleType[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchDailyScheduleData = async () => {
        const targetDate = selectedYearDate || dateFromQuery;
        if (!school || !targetDate) return;

        try {
            setIsLoading(true);
            const response = await getDailyScheduleAction(school.id, targetDate, {
                isPrivate: false,
            });
            if (response.success && response.data) {
                setCurrentDateData(response.data);
                setPrevSelectedDate(selectedYearDate);
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

    // TODO: need to check on production, possible that 1 render would cause issues 
    const blockRef = useRef<boolean>(true);
    useEffect(() => {
        if (selectedYearDate !== prevSelectedDate) {
            blockRef.current = true;
        }
        if (blockRef.current) {
            fetchDailyScheduleData();
        }
    }, [dateFromQuery, selectedYearDate, school]);

    if (isLoading) return <PublishedSkeleton />;

    return (
        <div className={styles.content}>
            <div className={styles.tableWrapper}>
                <ViewTable
                    scheduleData={currentDateData}
                    noScheduleTitle="אין נתונים להצגה"
                    noScheduleSubTitle={["לא פורסמה מערכת עבור יום זה"]}
                />
            </div>
        </div>
    );
};

export default HistorySchedulePage;
