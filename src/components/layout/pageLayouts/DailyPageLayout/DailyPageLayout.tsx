"use client";

import React from "react";
import styles from "./DailyPageLayout.module.css";
import router from "@/routes";
import { useDailyTableContext } from "@/context/DailyTableContext";
import DynamicInputSelect from "@/components/ui/select/InputSelect/DynamicInputSelect";
import DailyActionBtns from "@/components/actions/DailyActionBtns/DailyActionBtns";
import DailyPublishActionBtns from "@/components/actions/DailyPublishActionBtns/DailyPublishActionBtns";
import PageLayout from "../../PageLayout/PageLayout";

type DailyPageLayoutProps = {
    children: React.ReactNode;
};

export default function DailyPageLayout({ children }: DailyPageLayoutProps) {
    const { daysSelectOptions, selectedDate, isLoading, isPreviewMode, handleDayChange } = useDailyTableContext();

    if (isPreviewMode) return <>{children}</>;

    return (
        <PageLayout
            appType="private"
            HeaderRightActions={
                <>
                    <div className={styles.titleContainer}>
                        <h3>
                            {router.dailySchedule.title}
                        </h3>
                    </div>
                    <div className={styles.bar1DateContainer}>
                        <DynamicInputSelect
                            options={daysSelectOptions()}
                            value={selectedDate}
                            isDisabled={isLoading}
                            onChange={handleDayChange}
                            isSearchable={false}
                            placeholder="בחרו יום..."
                            hasBorder={true}
                            backgroundColor="transparent"
                            isBold={false}
                        />
                    </div>

                    <div className={styles.spacer} />

                    <div className={styles.topBarActionBtns}>
                        <DailyActionBtns position="left" />
                    </div>
                    <div className={styles.topBarActionBtnsShort}>
                        <DailyActionBtns position="left" useShortLabels={true} />
                    </div>
                </>
            }
            HeaderLeftActions={<DailyPublishActionBtns />}
            BottomActions={
                <div className={styles.bar2DateSection}>
                    <div className={styles.bar2DateContainer}>
                        <DynamicInputSelect
                            options={daysSelectOptions()}
                            value={selectedDate}
                            isDisabled={isLoading}
                            onChange={handleDayChange}
                            isSearchable={false}
                            placeholder="בחר יום..."
                            hasBorder={true}
                            isBold={false}
                            isCentered
                        />
                    </div>
                    <div className={styles.bar2DateContainerShort}>
                        <DynamicInputSelect
                            options={daysSelectOptions(true)}
                            value={selectedDate}
                            isDisabled={isLoading}
                            onChange={handleDayChange}
                            isSearchable={false}
                            placeholder="בחר יום..."
                            hasBorder={true}
                            isBold={false}
                            isCentered
                        />
                    </div>
                    <div className={styles.secondRowActionBtns}>
                        <DailyActionBtns position="left" useShortLabels={true} />
                    </div>
                    <div className={styles.mobileActionMenu}>
                        <DailyActionBtns position="left" useMobileMenu={true} useShortLabels={true} />
                    </div>
                </div>
            }
            contentClassName={styles.contentWithBottomMargin}
        >
            {children}
        </PageLayout>
    );
}
