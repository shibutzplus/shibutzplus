"use client";

import React, { useState, useEffect } from "react";
import styles from "./history.module.css";
import HistoryTable from "@/components/historyTable/HistoryTable/HistoryTable";
import { getDailyScheduleAction } from "@/app/actions/GET/getDailyScheduleAction";
import { DailyScheduleType } from "@/models/types/dailySchedule";
import { useMainContext } from "@/context/MainContext";
import { errorToast, successToast } from "@/lib/toast";
import messages from "@/resources/messages";
import { useHistoryTable } from "@/context/HistoryTableContext";

const History = () => {
    const { school } = useMainContext();
    const { selectedYearDate } = useHistoryTable();
    const [currentDateData, setCurrentDateData] = useState<DailyScheduleType[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchDailyScheduleData = async (date: string) => {
        if (!school || !date) return;

        setIsLoading(true);
        try {
            const response = await getDailyScheduleAction(school.id, date);
            if (response.success && response.data) {
                setCurrentDateData(response.data);
                //successToast(messages.dailySchedule.success);
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
        if (selectedYearDate && school) {
            fetchDailyScheduleData(selectedYearDate);
        } else {
            setCurrentDateData([]);
        }
    }, [selectedYearDate, school]);

    return (
        <div className={styles.content}>
            <div className={styles.tableWrapper}>
                <HistoryTable scheduleData={currentDateData} />
            </div>
        </div>
    );
};

export default History;
