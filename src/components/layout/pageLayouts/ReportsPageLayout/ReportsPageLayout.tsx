"use client";
import React from "react";
import styles from "./ReportsPageLayout.module.css";
import PageLayout from "../../PageLayout/PageLayout";
import router from "@/routes";
import { ReportType, ReportTypeValues } from "@/models/types/reports";
import { SCHOOL_MONTHS } from "@/utils/time";

type ReportsPageLayoutProps = {
    children: React.ReactNode;
    statType: ReportType;
    setStatType: (type: ReportType) => void;
    month: string;
    setMonth: (month: string) => void;
};

const OPTIONS = [
    { value: ReportTypeValues.months, label: "היעדרות לפי חודשים" },
    { value: ReportTypeValues.teachers, label: "היעדרות לפי מורים" },
    { value: ReportTypeValues.days, label: "היעדרות לפי ימי השבוע" },
];

const MONTH_OPTIONS = [
    { value: "all", label: "כל השנה" },
    ...SCHOOL_MONTHS.map((month) => ({ value: month, label: month })),
];

const SHORT_OPTIONS = [
    { value: ReportTypeValues.months, label: "לפי חודש" },
    { value: ReportTypeValues.teachers, label: "לפי מורה" },
    { value: ReportTypeValues.days, label: "לפי ימים" },
];

// Helper to generate formatted month options for mobile
const getMobileMonthOptions = () => {
    return [
        { value: "all", label: "הכל" },
        ...SCHOOL_MONTHS.map((m) => {
            const index = SCHOOL_MONTHS.indexOf(m);
            // SCHOOL_MONTHS starts at September (idx 0 -> 09)
            // 0(Sept)->9, 1(Oct)->10, ..., 3(Dec)->12, 4(Jan)->1
            const monthNum = ((index + 8) % 12) + 1;
            return {
                value: m,
                label: monthNum.toString().padStart(2, "0"),
            };
        }),
    ];
};

export default function ReportsPageLayout({
    children,
    statType,
    setStatType,
    month,
    setMonth,
}: ReportsPageLayoutProps) {
    const handleChange = (value: string) => {
        if (value in ReportTypeValues) {
            setStatType(value as ReportType);
        }
    };
    const handleMonthChange = (value: string) => {
        setMonth(value);
    };

    const mobileMonthOptions = getMobileMonthOptions();

    const HeaderRightActions = (
        <>
            <h3 className={styles.pageTitle}>{router.reports.title}</h3>
            <div className={styles.selectContainer}>
                <div className={styles.statsSelectWrapper}>
                    {/* Desktop Select */}
                    <select
                        className={`${styles.nativeSelect} ${styles.desktopOnly}`}
                        value={statType}
                        onChange={(e) => handleChange(e.target.value)}
                    >
                        {OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>

                    {/* Mobile Select */}
                    <select
                        className={`${styles.nativeSelect} ${styles.mobileOnly}`}
                        value={statType}
                        onChange={(e) => handleChange(e.target.value)}
                    >
                        {SHORT_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>
                {statType !== ReportTypeValues.months && (
                    <div className={styles.monthSelectWrapper}>
                        {/* Desktop Month Select */}
                        <select
                            className={`${styles.nativeSelect} ${styles.desktopOnly}`}
                            value={month}
                            onChange={(e) => handleMonthChange(e.target.value)}
                        >
                            {MONTH_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>

                        {/* Mobile Month Select */}
                        <select
                            className={`${styles.nativeSelect} ${styles.mobileOnly}`}
                            value={month}
                            onChange={(e) => handleMonthChange(e.target.value)}
                        >
                            {mobileMonthOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>
        </>
    );

    return (
        <PageLayout appType="private" leftSideWidth={0} HeaderRightActions={HeaderRightActions}>
            {children}
        </PageLayout>
    );
}
