"use client";

import React from "react";
import styles from "./DailyPageLayout.module.css";
import router from "@/routes";
import { useDailyTableContext } from "@/context/DailyTableContext";
import DynamicInputSelect from "@/components/ui/select/InputSelect/DynamicInputSelect";
import MobileNavLayout from "../../MobileNavLayout/MobileNavLayout";
import DailyActionBtns from "@/components/actions/DailyActionBtns/DailyActionBtns";
import DailyPublishActionBtns from "@/components/actions/DailyPublishActionBtns/DailyPublishActionBtns";
import PageLayout from "../../PageLayout/PageLayout";

type DailyPageLayoutProps = {
    children: React.ReactNode;
};

export default function DailyPageLayout({ children }: DailyPageLayoutProps) {
    const { daysSelectOptions, selectedDate, isLoading, isEditMode, handleDayChange } =
        useDailyTableContext();

    return (
        <PageLayout
            appType="private"
            isFullHeight={!isEditMode}
            hasMobileLogo={false}
            HeaderRightActions={
                <>
                    <div className={styles.titleContainer}>
                        <h3>
                            {router.dailySchedule.title}
                            {!isEditMode && (
                                <span className={styles.previewModeLabel}>{" (תצוגת בדיקה)"}</span>
                            )}
                        </h3>
                    </div>
                    <div className={styles.topNavSelectContainer}>
                        <div className={styles.selectContainer}>
                            <DynamicInputSelect
                                options={daysSelectOptions()}
                                value={selectedDate}
                                isDisabled={isLoading}
                                onChange={handleDayChange}
                                isSearchable={false}
                                placeholder="בחרו יום..."
                                hasBorder={true}
                                isBold={false}
                            />
                        </div>

                        {isEditMode ? (
                            <div className={styles.desktopActionBtns}>
                                <DailyActionBtns position="left" />
                            </div>
                        ) : null}
                    </div>
                </>
            }
            HeaderLeftActions={<DailyPublishActionBtns />}
            BottomActions={
                <div className={styles.dateSelectContainer}>
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
            }
            MobileActions={
                isEditMode ? (
                    <MobileNavLayout>
                        <DailyActionBtns position="top" />
                    </MobileNavLayout>
                ) : null
            }
        >
            {children}
        </PageLayout>
    );
}
