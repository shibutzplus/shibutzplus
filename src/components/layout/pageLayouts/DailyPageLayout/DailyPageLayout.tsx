"use client";

import React, { useState } from "react";
import styles from "./DailyPageLayout.module.css";
import Logo from "@/components/ui/Logo/Logo";
import HamburgerNav, { HamburgerButton } from "@/components/navigation/HamburgerNav/HamburgerNav";
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

    const selectedOption = daysSelectOptions().find((opt) => opt.value === selectedDate);
    const dateLabel = selectedOption ? selectedOption.label : selectedDate;
    const mobileDateLabel = dateLabel.replace(" (היום)", "").replace(" (מחר)", "");

    return (
        <PageLayout
            appType="private"
            isFullHeight={!isEditMode}
            HeaderRightActions={
                <>
                    <div className={styles.titleContainer}>
                        <h3>{router.dailySchedule.title}</h3>
                        {!isEditMode && (
                            <span className={styles.previewDateLabelMobileTop}>
                                {mobileDateLabel}
                            </span>
                        )}
                    </div>
                    <div className={styles.topNavSelectContainer}>
                        <div className={styles.selectContainer}>
                            {isEditMode ? (
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
                            ) : (
                                <div className={styles.previewDateLabel}>{dateLabel}</div>
                            )}
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
                isEditMode && (
                    <div className={styles.mobileSelectContainer}>
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
                )
            }
            MobileActions={
                isEditMode ? (
                    <MobileNavLayout>
                        <DailyActionBtns position="top" />
                    </MobileNavLayout>
                ) : null
            }
        >
            {/* className={styles.mainContent + (!isEditMode ? " " + styles.fullHeight : "")} */}
            {children}
        </PageLayout>
    );
}
