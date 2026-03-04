"use client";

import React from "react";
import styles from "./AnnualAltBuildPageLayout.module.css";
import DynamicInputSelect from "@/components/ui/select/InputSelect/DynamicInputSelect";
import router from "@/routes";
import { useAnnualAltByDay } from "@/context/AnnualAltByDayContext";
import PageLayout from "../../PageLayout/PageLayout";
import Icons from "@/style/icons";
import { DAYS_OF_WORK_WEEK } from "@/utils/time";

type AnnualAltBuildPageLayoutProps = {
    children: React.ReactNode;
};

export default function AnnualAltBuildPageLayout({ children }: AnnualAltBuildPageLayoutProps) {
    const { daysSelectOptions, selectedDay, handleDayChange, isSaving, isLoading } =
        useAnnualAltByDay();

    const handleNextDay = () => {
        const options = DAYS_OF_WORK_WEEK;
        const currentIndex = options.indexOf(selectedDay);
        const nextIndex = (currentIndex + 1) % options.length;
        handleDayChange(options[nextIndex]);
    };

    const handlePrevDay = () => {
        const options = DAYS_OF_WORK_WEEK;
        const currentIndex = options.indexOf(selectedDay);
        const prevIndex = (currentIndex - 1 + options.length) % options.length;
        handleDayChange(options[prevIndex]);
    };

    return (
        <PageLayout
            appType="private"
            leftSideWidth={50}
            HeaderRightActions={
                <>
                    <h3 className={styles.pageTitle}>{router.annualAltBuild.title}</h3>
                    <div className={styles.selectContainer}>
                        <div className={styles.selectWrapper}>
                            <DynamicInputSelect
                                options={daysSelectOptions()}
                                value={selectedDay}
                                onChange={handleDayChange}
                                isSearchable={false}
                                isDisabled={isSaving || isLoading}
                                placeholder="יום..."
                                hasBorder
                            />
                        </div>
                        <button
                            className={styles.nextButton}
                            onClick={handlePrevDay}
                            title="הקודם"
                            type="button"
                        >
                            <Icons.caretRight size={24} />
                        </button>
                        <button
                            className={styles.nextButton}
                            onClick={handleNextDay}
                            title="הבא"
                            type="button"
                        >
                            <Icons.caretLeft size={24} />
                        </button>
                    </div>
                </>
            }
        >
            <div className={styles.printMessage}>
                מסך זה גדול מידי כדי שניתן יהיה להדפיס אותו
            </div>
            <div className={styles.hideOnPrint}>
                {children}
            </div>
        </PageLayout>
    );
}
