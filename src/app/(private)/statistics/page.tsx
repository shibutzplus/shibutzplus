"use client";

import React, { useState, useEffect } from "react";
import StatisticsPageLayout from "@/components/layout/pageLayouts/StatisticsPageLayout/StatisticsPageLayout";
import { useOptionalMainContext } from "@/context/MainContext";
import { getAbsencesByMonthAction, AbsenceByMonth } from "@/app/actions/GET/getAbsencesByMonthAction";
import { getAbsencesByTeacherAction, AbsenceByTeacher } from "@/app/actions/GET/getAbsencesByTeacherAction";
import { getAbsencesByDayAction, AbsenceByDay } from "@/app/actions/GET/getAbsencesByDayAction";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import styles from "./page.module.css";
import { errorToast } from "@/lib/toast";
import { StatisticType, StatisticTypeValues } from "@/models/types/statistics";
import { getHebrewMonthName, getCurrentMonth } from "@/utils/time";


export default function StatisticsPage() {
    const context = useOptionalMainContext();
    const schoolId = context?.school?.id;
    const [statType, setStatType] = useState<StatisticType>(StatisticTypeValues.months);
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
                if (statType === StatisticTypeValues.months) {
                    const res = await getAbsencesByMonthAction(schoolId);
                    if (res.success && res.data) {
                        setMonthData(res.data);
                    } else {
                        errorToast("אופס, משהו השתבש בטעינת הנתונים. נסו לרענן, ואם זה לא מסתדר – דברו איתנו.");
                    }
                } else if (statType === StatisticTypeValues.teachers) {
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
                    <div className={styles.spinner}></div>
                ) : (statType === StatisticTypeValues.months && monthData.length === 0) || (statType === StatisticTypeValues.teachers && teacherData.length === 0) || (statType === StatisticTypeValues.days && dayData.length === 0) ? (
                    <div className={styles.placeholder}>לא נמצאו היעדרויות עבור הסינון שנבחר</div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        {statType === StatisticTypeValues.months ? (
                            <BarChart
                                data={monthData}
                                margin={{
                                    top: 20,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                }}
                            >
                                <defs>
                                    <linearGradient id="colorMonth" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorMonthGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#8884d8" stopOpacity={1} />
                                        <stop offset="100%" stopColor="#605ca8" stopOpacity={1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="month"
                                    height={isMobile ? 100 : 30}
                                    interval={0}
                                    angle={isMobile ? -90 : 0}
                                    tick={{
                                        fontSize: isMobile ? 12 : 14,
                                        textAnchor: isMobile ? "end" : "middle",
                                    }}
                                />
                                <YAxis
                                    allowDecimals={false}
                                    width={50}
                                    tickMargin={10}
                                    orientation="left"
                                    tick={{ className: styles.axisTick }}
                                />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Bar name="ימי היעדרות" dataKey="count" fill="url(#colorMonthGradient)" radius={[4, 4, 0, 0]} maxBarSize={150} />
                            </BarChart>
                        ) : statType === StatisticTypeValues.teachers ? (
                            <BarChart
                                layout="vertical"
                                data={teacherData}
                                margin={{
                                    top: 20,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                }}
                            >
                                <defs>
                                    <linearGradient id="colorTeacherGradient" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#82ca9d" stopOpacity={1} />
                                        <stop offset="100%" stopColor="#4fab72" stopOpacity={1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" allowDecimals={false} label={{ value: "מספר ימי היעדרות", position: "insideBottom", offset: -5, style: { fill: '#666', fontSize: '12px' } }} />
                                <YAxis
                                    dataKey="teacherName"
                                    type="category"
                                    width={isMobile ? 110 : 180}
                                    tick={{ className: styles.teacherAxisTick }}
                                    interval={0} // Show all labels
                                />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Bar name="ימי היעדרויות" dataKey="count" fill="url(#colorTeacherGradient)" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        ) : (
                            <BarChart
                                data={dayData}
                                margin={{
                                    top: 20,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                }}
                            >
                                <defs>
                                    <linearGradient id="colorDayGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#8884d8" stopOpacity={1} />
                                        <stop offset="100%" stopColor="#605ca8" stopOpacity={1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="day"
                                    height={isMobile ? 100 : 30}
                                    interval={0} // Show all labels
                                    angle={isMobile ? -90 : 0}
                                    tick={{
                                        fontSize: isMobile ? 12 : 14,
                                        textAnchor: isMobile ? "end" : "middle",
                                    }}
                                />
                                <YAxis
                                    allowDecimals={false}
                                    width={50}
                                    tickMargin={10}
                                    orientation="left"
                                    tick={{ className: styles.axisTick }}
                                />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Bar name="ימי היעדרויות" dataKey="count" fill="url(#colorDayGradient)" radius={[4, 4, 0, 0]} maxBarSize={150} />
                            </BarChart>
                        )}
                    </ResponsiveContainer>
                )}
            </div>
        </StatisticsPageLayout>
    );
}
