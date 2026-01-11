"use client";

import React from "react";
import styles from "./StatisticsPageLayout.module.css";
import PageLayout from "../../PageLayout/PageLayout";
import router from "@/routes";
import { StatisticType, StatisticTypeValues } from "@/models/types/statistics";
import DynamicInputSelect from "@/components/ui/select/InputSelect/DynamicInputSelect";
import {
    STATISTICS_OPTIONS,
    STATISTICS_SHORT_OPTIONS,
    STATISTICS_MONTH_OPTIONS,
    STATISTICS_MOBILE_MONTH_OPTIONS,
} from "@/resources/statistics";

type StatisticsPageLayoutProps = {
    children: React.ReactNode;
    statType: StatisticType;
    setStatType: (type: StatisticType) => void;
    month: string;
    setMonth: (month: string) => void;
};

export default function StatisticsPageLayout({
    children,
    statType,
    setStatType,
    month,
    setMonth,
}: StatisticsPageLayoutProps) {
    const handleChange = (value: string) => {
        if (value in StatisticTypeValues) {
            setStatType(value as StatisticType);
        }
    };

    const handleMonthChange = (value: string) => {
        setMonth(value);
    };

    const HeaderRightActions = (
        <>
            <h3 className={styles.pageTitle}>{router.statistics.title}</h3>
            <div className={styles.selectContainer}>
                <div className={styles.statsSelectWrapper}>
                    {/* Desktop Select */}
                    <div className={styles.desktopOnly}>
                        <DynamicInputSelect
                            options={STATISTICS_OPTIONS}
                            value={statType}
                            onChange={handleChange}
                            isSearchable={false}
                            hasBorder
                        />
                    </div>

                    {/* Mobile Select */}
                    <div className={styles.mobileOnly}>
                        <DynamicInputSelect
                            options={STATISTICS_SHORT_OPTIONS}
                            value={statType}
                            onChange={handleChange}
                            isSearchable={false}
                            hasBorder
                        />
                    </div>
                </div>
                {statType !== StatisticTypeValues.months && (
                    <div className={styles.monthSelectWrapper}>
                        {/* Desktop Month Select */}
                        <div className={styles.desktopOnly}>
                            <DynamicInputSelect
                                options={STATISTICS_MONTH_OPTIONS}
                                value={month}
                                onChange={handleMonthChange}
                                isSearchable={false}
                                hasBorder
                            />
                        </div>

                        {/* Mobile Month Select */}
                        <div className={styles.mobileOnly}>
                            <DynamicInputSelect
                                options={STATISTICS_MOBILE_MONTH_OPTIONS}
                                value={month}
                                onChange={handleMonthChange}
                                isSearchable={false}
                                hasBorder
                            />
                        </div>
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
