"use client";

import React from "react";
import styles from "./AnnualClassPageLayout.module.css";
import DynamicInputSelect from "@/components/ui/select/InputSelect/DynamicInputSelect";
import router from "@/routes";
import { useAnnualByClass } from "@/context/AnnualByClassContext";
import PageLayout from "../../PageLayout/PageLayout";
import { useValidation } from "@/context/ValidationContext";
import { usePopup, PopupAction } from "@/context/PopupContext";
import ConfirmPopup from "@/components/popups/ConfirmPopup/ConfirmPopup";
import { removeIncompleteCells } from "@/utils/scheduleValidation";
import Icons from "@/style/icons";

type AnnualClassPageLayoutProps = {
    children: React.ReactNode;
};

export default function AnnualClassPageLayout({ children }: AnnualClassPageLayoutProps) {
    const { classesSelectOptions, selectedClassId, handleClassChange: originalHandleClassChange, isSaving, isLoading, schedule, setSchedule } =
        useAnnualByClass();
    const { validate } = useValidation();
    const { openPopup } = usePopup();

    const handleClassChange = (val: string) => {
        handleBeforeMenuOpen().then((shouldProceed) => {
            if (shouldProceed) {
                originalHandleClassChange(val);
            }
        });
    };

    const handleNextClass = () => {
        const options = classesSelectOptions();
        if (options.length === 0) return;

        const currentIndex = options.findIndex((opt) => opt.value === selectedClassId);
        const nextIndex = (currentIndex + 1) % options.length;
        const nextClassId = options[nextIndex].value;

        handleClassChange(nextClassId);
    };

    const handlePrevClass = () => {
        const options = classesSelectOptions();
        if (options.length === 0) return;

        const currentIndex = options.findIndex((opt) => opt.value === selectedClassId);
        const prevIndex = (currentIndex - 1 + options.length) % options.length;
        const prevClassId = options[prevIndex].value;

        handleClassChange(prevClassId);
    };

    const handleBeforeMenuOpen = (): Promise<boolean> => {
        return new Promise((resolve) => {
            if (validate()) {
                resolve(true);
            } else {
                openPopup(
                    PopupAction.msgPopup,
                    "S",
                    <ConfirmPopup
                        text="שימו ❤️: שעות ללא שיוך מלא (מורה + מקצוע) לא יישמרו."
                        yesText="להישאר במסך ולתקן"
                        noText="להמשיך ללא שמירה"
                        onYes={async () => {
                            resolve(false);
                        }}
                        onNo={() => {
                            const cleanedSchedule = removeIncompleteCells(schedule);
                            setSchedule(cleanedSchedule);
                            resolve(true);
                        }}
                        defaultAnswer="yes"
                    />
                );
            }
        });
    };

    return (
        <PageLayout
            appType="private"
            leftSideWidth={50}
            onBeforeMenuOpen={handleBeforeMenuOpen}
            HeaderRightActions={
                <>
                    <h3 className={styles.pageTitleLong}>{router.annualByClass.title}</h3>
                    <h3 className={styles.pageTitleShort}>מערכת לפי כיתה</h3>
                    <div className={styles.selectContainer}>
                        <div className={styles.selectWrapper}>
                            <DynamicInputSelect
                                options={classesSelectOptions()}
                                value={selectedClassId}
                                onChange={handleClassChange}
                                isSearchable={true}
                                isDisabled={isSaving || isLoading}
                                placeholder="כיתה/קבוצה..."
                                hasBorder
                            />
                        </div>
                        <button
                            className={styles.nextButton}
                            onClick={handlePrevClass}
                            title="הקודם"
                            type="button"
                        >
                            <Icons.caretRight size={24} />
                        </button>
                        <button
                            className={styles.nextButton}
                            onClick={handleNextClass}
                            title="הבא"
                            type="button"
                        >
                            <Icons.caretLeft size={24} />
                        </button>
                    </div>
                </>
            }
        >
            {children}
        </PageLayout>
    );
}
