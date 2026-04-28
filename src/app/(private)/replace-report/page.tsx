"use client";

import React, { useState, useEffect } from "react";
import ReplaceReportPageLayout from "@/components/layout/pageLayouts/ReplaceReportPageLayout/ReplaceReportPageLayout";
import Preloader from "@/components/ui/Preloader/Preloader";
import { getHebrewMonthName, getCurrentMonth } from "@/utils/time";
import styles from "./page.module.css";
import { useOptionalMainContext } from "@/context/MainContext";
import MngrReplaceReportTable from "@/components/tables/mngrReplaceReport/MngrReplaceReportTable/MngrReplaceReportTable";
import { getReplaceReportDataAction } from "@/app/actions/GET/getReplaceReportDataAction";

// { [teacherId]: { [dayOfMonth]: hourCount } }
export type ReplaceReportDictionary = Record<string, Record<number, number>>;

export default function ReplaceReportPage() {
    const context = useOptionalMainContext();
    const schoolId = context?.school?.id;
    const [month, setMonth] = useState<string>(getHebrewMonthName(getCurrentMonth()));
    const [teacherId, setTeacherId] = useState<string | null>("all");
    const [loading, setLoading] = useState<boolean>(false);
    const [reportData, setReportData] = useState<ReplaceReportDictionary>({});

    const fetchReportData = async () => {
        if (!schoolId) return;
        setLoading(true);
        try {
            const response = await getReplaceReportDataAction(schoolId, month);
            if (response.success && response.data) {
                const dictionary: ReplaceReportDictionary = {};
                response.data.forEach((record) => {
                    // Match subTeacher name -> teacher ID
                    const teacher = context?.teachers?.find(
                        (t) => t.name === record.subTeacher
                    );
                    if (!teacher) return;

                    const tid = teacher.id;
                    const day = record.dayOfMonth;

                    if (!dictionary[tid]) dictionary[tid] = {};
                    dictionary[tid][day] = (dictionary[tid][day] || 0) + 1;
                });
                setReportData(dictionary);
            } else {
                setReportData({});
            }
        } catch (error) {
            console.error("Error loading replace report:", error);
            setReportData({});
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReportData();
    }, [schoolId, month]);

    return (
        <ReplaceReportPageLayout
            month={month}
            setMonth={setMonth}
            teacherId={teacherId}
            setTeacherId={setTeacherId}
            reportData={reportData}
        >
            <div className={styles.container}>
                {loading ? (
                    <div style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%, -50%)" }}>
                        <Preloader />
                    </div>
                ) : !teacherId ? (
                    <div className={styles.placeholder}>בחרו חודש ומורה כדי להציג את דוח המחליפים</div>
                ) : (
                    <MngrReplaceReportTable
                        month={month}
                        teacherId={teacherId}
                        teachers={context?.teachers || []}
                        reportData={reportData}
                    />
                )}
            </div>
        </ReplaceReportPageLayout>
    );
}
