"use client";

import React, { useState, useEffect } from "react";
import MissingReportPageLayout from "@/components/layout/pageLayouts/MissingReportPageLayout/MissingReportPageLayout";
import Preloader from "@/components/ui/Preloader/Preloader";
import { getHebrewMonthName, getCurrentMonth } from "@/utils/time";
import styles from "./page.module.css";
import { useOptionalMainContext } from "@/context/MainContext";
import MngrMissingReportTable from "@/components/tables/mngrMissingReport/MngrMissingReportTable/MngrMissingReportTable";
import { getMissingReportDataAction, MissingReportRecord } from "@/app/actions/GET/getMissingReportDataAction";

export type MissingReportDictionary = Record<string, Record<number, MissingReportRecord[]>>;

export default function MissingReportPage() {
    const context = useOptionalMainContext();
    const schoolId = context?.school?.id;
    const settings = context?.settings;

    const [month, setMonth] = useState<string>(getHebrewMonthName(getCurrentMonth()));
    const [teacherId, setTeacherId] = useState<string | null>("all");
    const [loading, setLoading] = useState<boolean>(false);
    const [reportData, setReportData] = useState<MissingReportDictionary>({});

    const fetchReportData = async () => {
        if (!schoolId) return;
        setLoading(true);
        try {
            const response = await getMissingReportDataAction(schoolId, month);
            if (response.success && response.data) {
                // Group data by Teacher ID and then by Day of Month
                const dictionary: MissingReportDictionary = {};
                response.data.forEach(record => {
                    const contextTeacher = context?.teachers?.find(t => t.name === record.originalTeacher);
                    if (!contextTeacher) return;

                    const tid = contextTeacher.id;
                    const day = record.dayOfMonth;

                    if (!dictionary[tid]) dictionary[tid] = {};
                    if (!dictionary[tid][day]) dictionary[tid][day] = [];

                    dictionary[tid][day].push(record);
                });
                setReportData(dictionary);
            } else {
                setReportData({});
            }
        } catch (error) {
            console.error("Error loading missing report:", error);
            setReportData({});
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReportData();
    }, [schoolId, month]);

    return (
        <MissingReportPageLayout
            month={month}
            setMonth={setMonth}
            teacherId={teacherId}
            setTeacherId={setTeacherId}
            reportData={reportData}
        >
            <div className={styles.container}>
                {loading ? (
                    <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                        <Preloader />
                    </div>
                ) : !teacherId ? (
                    <div className={styles.placeholder}>בחרו חודש ומורה כדי להציג את דוח החוסרים</div>
                ) : (
                    <MngrMissingReportTable
                        month={month}
                        teacherId={teacherId}
                        teachers={context?.teachers || []}
                        reportData={reportData}
                        onRefresh={fetchReportData}
                    />
                )}
            </div>
        </MissingReportPageLayout>
    );
}
