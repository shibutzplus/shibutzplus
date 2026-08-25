"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import StatisticsPageLayout from "@/components/layout/pageLayouts/StatisticsPageLayout/StatisticsPageLayout";
import Preloader from "@/components/ui/Preloader/Preloader";
import { useOptionalMainContext } from "@/context/MainContext";
import { getAbsencesByMonthAction, AbsenceByMonth } from "@/app/actions/GET/getAbsencesByMonthAction";
import { getAbsencesByTeacherAction, AbsenceByTeacher } from "@/app/actions/GET/getAbsencesByTeacherAction";
import { getAbsencesByDayAction, AbsenceByDay } from "@/app/actions/GET/getAbsencesByDayAction";
import styles from "./page.module.css";
import { errorToast } from "@/lib/toast";
import { StatisticsType, StatisticsTypeValues } from "@/models/types/statistics";
import { getHebrewMonthName, getCurrentMonth } from "@/utils/time";

const StatisticsChart = dynamic(() => import("./StatisticsChart"), {
    ssr: false,
    loading: () => (
        <div style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%, -50%)" }}>
            <Preloader />
        </div>
    ),
});

export default function StatisticsPage() {
    const context = useOptionalMainContext();
    const schoolId = context?.school?.id;
    const [statType, setStatType] = useState<StatisticsType>(StatisticsTypeValues.months);
    const [month, setMonth] = useState<string>(getHebrewMonthName(getCurrentMonth()));
    const [monthData, setMonthData] = useState<AbsenceByMonth[]>([]);
    const [teacherData, setTeacherData] = useState<AbsenceByTeacher[]>([]);
    const [dayData, setDayData] = useState<AbsenceByDay[]>([]);
    const [loading, setLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 600);
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        if (!schoolId) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                if (statType === StatisticsTypeValues.months) {
                    const res = await getAbsencesByMonthAction(schoolId);
                    if (res.success && res.data) {
                        setMonthData(res.data);
                    } else {
                        errorToast("אופס, משהו השתבש בטעינת הנתונים. נסו לרענן, ואם זה לא מסתדר – דברו איתנו.");
                    }
                } else if (statType === StatisticsTypeValues.teachers) {
                    const res = await getAbsencesByTeacherAction(schoolId, month);
                    if (res.success && res.data) {
                        setTeacherData(res.data);
                    } else {
                        errorToast("אופס, משהו השתבש בטעינת הנתונים. נסו לרענן, ואם זה לא מסתדר – דברו איתנו.");
                    }
                } else {
                    const res = await getAbsencesByDayAction(schoolId, month);
                    if (res.success && res.data) {
                        setDayData(res.data);
                    } else {
                        errorToast("אופס, משהו השתבש בטעינת הנתונים. נסו לרענן, ואם זה לא מסתדר – דברו איתנו.");
                    }
                }
            } catch (_error) {
                errorToast("אופס, משהו השתבש בטעינת הנתונים. נסו לרענן, ואם זה לא מסתדר – דברו איתנו.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [schoolId, statType, month]);

    return (
        <StatisticsPageLayout statType={statType} setStatType={setStatType} month={month} setMonth={setMonth}>
            <div className={styles.chartContainer}>
                {loading ? (
                    <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                        <Preloader />
                    </div>
                ) : (
                    <StatisticsChart
                        statType={statType}
                        monthData={monthData}
                        teacherData={teacherData}
                        dayData={dayData}
                        isMobile={isMobile}
                    />
                )}
            </div>
        </StatisticsPageLayout>
    );
}
