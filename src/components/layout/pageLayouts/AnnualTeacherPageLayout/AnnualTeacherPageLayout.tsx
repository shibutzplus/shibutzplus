"use client";

import React from "react";
import styles from "./AnnualTeacherPageLayout.module.css";
import DynamicInputSelect from "@/components/ui/select/InputSelect/DynamicInputSelect";
import router from "@/routes";
import { useAnnualByTeacher } from "@/context/AnnualByTeacherContext";
import PageLayout from "../../PageLayout/PageLayout";
import { useValidation } from "@/context/ValidationContext";
import { usePopup, PopupAction } from "@/context/PopupContext";
import ConfirmPopup from "@/components/popups/ConfirmPopup/ConfirmPopup";
import { removeIncompleteCells } from "@/utils/scheduleValidation";
import Icons from "@/style/icons";

type AnnualTeacherPageLayoutProps = {
    children: React.ReactNode;
};

export default function AnnualTeacherPageLayout({ children }: AnnualTeacherPageLayoutProps) {
    const { teachersSelectOptions, selectedTeacherId, handleTeacherChange: originalHandleTeacherChange, isSaving, isLoading, schedule, setSchedule } =
        useAnnualByTeacher();
    const { validate } = useValidation();
    const { openPopup } = usePopup();

    const handleTeacherChange = (val: string) => {
        handleBeforeMenuOpen().then((shouldProceed) => {
            if (shouldProceed) {
                originalHandleTeacherChange(val);
            }
        });
    };

    const handleNextTeacher = () => {
        const options = teachersSelectOptions();
        if (options.length === 0) return;

        const currentIndex = options.findIndex((opt) => opt.value === selectedTeacherId);
        const nextIndex = (currentIndex + 1) % options.length;
        const nextTeacherId = options[nextIndex].value;

        handleTeacherChange(nextTeacherId);
    };

    const handlePrevTeacher = () => {
        const options = teachersSelectOptions();
        if (options.length === 0) return;

        const currentIndex = options.findIndex((opt) => opt.value === selectedTeacherId);
        const prevIndex = (currentIndex - 1 + options.length) % options.length;
        const prevTeacherId = options[prevIndex].value;

        handleTeacherChange(prevTeacherId);
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
                        text="שימו ❤️: שעות ללא שיוך מלא (מקצוע + כיתה) לא יישמרו."
                        showIcon={false}
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
                    <h3 className={styles.pageTitleLong}>{router.annualByTeacher.title}</h3>
                    <h3 className={styles.pageTitleShort}>מערכת לפי מורה</h3>
                    <div className={styles.selectContainer}>
                        <div className={styles.selectWrapper}>
                            <DynamicInputSelect
                                options={teachersSelectOptions()}
                                value={selectedTeacherId}
                                onChange={handleTeacherChange}
                                isSearchable={true}
                                isDisabled={isSaving || isLoading}
                                placeholder="מורה..."
                                hasBorder
                            />
                        </div>
                        <button
                            className={styles.nextButton}
                            onClick={handlePrevTeacher}
                            title="הקודם"
                            type="button"
                        >
                            <Icons.caretRight size={24} />
                        </button>
                        <button
                            className={styles.nextButton}
                            onClick={handleNextTeacher}
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
