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
import IconBtn from "@/components/ui/buttons/IconBtn/IconBtn";
import Icons from "@/style/icons";

type DailyPageLayoutProps = {
    children: React.ReactNode;
};

export default function DailyPageLayout({ children }: DailyPageLayoutProps) {
    const { daysSelectOptions, selectedDate, isLoading, isEditMode, handleDayChange, mainDailyTable } =
        useDailyTableContext();

    const handlePrintClick = async () => {
        try {
            const { pdf } = await import('@react-pdf/renderer');
            const { default: DailySchedulePdf } = await import('@/components/pdf/DailySchedulePdf');

            const blob = await pdf(
                <DailySchedulePdf
                    mainDailyTable={mainDailyTable}
                    selectedDate={selectedDate}
                />
            ).toBlob();

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `daily-schedule-${selectedDate}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error generating PDF:", error);
        }
    };

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

                    {isEditMode ? (
                        <div className={styles.topBarActionBtns}>
                            <DailyActionBtns position="left" />
                        </div>
                    ) : (
                        // FFU
                        false && (
                            <span title="שמירה לקובץ PDF" className={styles.pdfBtnWrapper}>
                                <IconBtn
                                    Icon={<Icons.toPDF size={20} />}
                                    onClick={handlePrintClick}
                                    hasBorder
                                />
                            </span>
                        )
                    )}
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
                </div>
            }
            MobileActions={
                isEditMode ? (
                    <div className={styles.bottomBarActionBtns}>
                        <MobileNavLayout>
                            <DailyActionBtns position="top" />
                        </MobileNavLayout>
                    </div>
                ) : null
            }
            contentClassName={
                isEditMode ? styles.contentWithBottomMargin : styles.contentFullHeight
            }
        >
            {children}
        </PageLayout>
    );
}
