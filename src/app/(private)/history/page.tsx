"use client";

import React, { useState, useEffect } from "react";
import styles from "./history.module.css";
import { getDailyScheduleAction } from "@/app/actions/GET/getDailyScheduleAction";
import { DailyScheduleType } from "@/models/types/dailySchedule";
import { useMainContext } from "@/context/MainContext";
import { errorToast } from "@/lib/toast";
import messages from "@/resources/messages";
import { useHistoryTable } from "@/context/HistoryTableContext";
import ReadOnlyDailyTable from "@/components/readOnlyDailyTable/ReadOnlyDailyTable/ReadOnlyDailyTable";
import { useSearchParams } from "next/navigation"; // read ?date= from URL

const History = () => {
    const { school } = useMainContext();
    const { selectedYearDate } = useHistoryTable();
    const searchParams = useSearchParams();
    const dateFromQuery = searchParams.get("date"); // format: YYYY-MM-DD

    const [currentDateData, setCurrentDateData] = useState<DailyScheduleType[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchDailyScheduleData = async (date: string) => {
        if (!school || !date) return;
        setIsLoading(true);
        try {
            const response = await getDailyScheduleAction(school.id, date);
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
        const targetDate = dateFromQuery || selectedYearDate;
        if (targetDate && school) {
            fetchDailyScheduleData(targetDate);
        } else {
            setCurrentDateData([]);
        }
    }, [school, dateFromQuery, selectedYearDate]);

    return (
        <div className={styles.content}>
            <div className={styles.tableWrapper}>
                <ReadOnlyDailyTable scheduleData={currentDateData} />
            </div>
        </div>
    );
};

export default History;
