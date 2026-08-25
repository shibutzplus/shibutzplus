"use client";

import React from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import styles from "./page.module.css";
import { StatisticsType, StatisticsTypeValues } from "@/models/types/statistics";
import { AbsenceByMonth } from "@/app/actions/GET/getAbsencesByMonthAction";
import { AbsenceByTeacher } from "@/app/actions/GET/getAbsencesByTeacherAction";
import { AbsenceByDay } from "@/app/actions/GET/getAbsencesByDayAction";

interface StatisticsChartProps {
    statType: StatisticsType;
    monthData: AbsenceByMonth[];
    teacherData: AbsenceByTeacher[];
    dayData: AbsenceByDay[];
    isMobile: boolean;
}

export default function StatisticsChart({
    statType,
    monthData,
    teacherData,
    dayData,
    isMobile,
}: StatisticsChartProps) {
    const isEmpty =
        (statType === StatisticsTypeValues.months && monthData.length === 0) ||
        (statType === StatisticsTypeValues.teachers && teacherData.length === 0) ||
        (statType === StatisticsTypeValues.days && dayData.length === 0);

    if (isEmpty) {
        return (
            <div className={styles.placeholder}>לא נמצאו היעדרויות עבור הסינון שנבחר</div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            {statType === StatisticsTypeValues.months ? (
                <BarChart
                    data={monthData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
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
                        tick={{ fontSize: isMobile ? 12 : 14, textAnchor: isMobile ? "end" : "middle" }}
                    />
                    <YAxis
                        allowDecimals={false}
                        width={50}
                        tickMargin={10}
                        orientation="left"
                        tick={{ className: styles.axisTick }}
                    />
                    <Tooltip cursor={{ fill: "transparent" }} />
                    <Bar name="ימי היעדרות" dataKey="count" fill="url(#colorMonthGradient)" radius={[4, 4, 0, 0]} maxBarSize={150} />
                </BarChart>
            ) : statType === StatisticsTypeValues.teachers ? (
                <BarChart
                    layout="vertical"
                    data={teacherData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                    <defs>
                        <linearGradient id="colorTeacherGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#82ca9d" stopOpacity={1} />
                            <stop offset="100%" stopColor="#4fab72" stopOpacity={1} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        type="number"
                        allowDecimals={false}
                        label={{ value: "מספר ימי היעדרות", position: "insideBottom", offset: -5, style: { fill: "#666", fontSize: "12px" } }}
                    />
                    <YAxis
                        dataKey="teacherName"
                        type="category"
                        width={isMobile ? 110 : 180}
                        tick={{ className: styles.teacherAxisTick }}
                        interval={0}
                    />
                    <Tooltip cursor={{ fill: "transparent" }} />
                    <Bar name="ימי היעדרויות" dataKey="count" fill="url(#colorTeacherGradient)" radius={[0, 4, 4, 0]} barSize={40} />
                </BarChart>
            ) : (
                <BarChart
                    data={dayData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
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
                        interval={0}
                        angle={isMobile ? -90 : 0}
                        tick={{ fontSize: isMobile ? 12 : 14, textAnchor: isMobile ? "end" : "middle" }}
                    />
                    <YAxis
                        allowDecimals={false}
                        width={50}
                        tickMargin={10}
                        orientation="left"
                        tick={{ className: styles.axisTick }}
                    />
                    <Tooltip cursor={{ fill: "transparent" }} />
                    <Bar name="ימי היעדרויות" dataKey="count" fill="url(#colorDayGradient)" radius={[4, 4, 0, 0]} maxBarSize={150} />
                </BarChart>
            )}
        </ResponsiveContainer>
    );
}
