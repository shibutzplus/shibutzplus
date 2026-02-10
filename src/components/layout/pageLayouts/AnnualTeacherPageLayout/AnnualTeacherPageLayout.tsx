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
                </>
            }
        >
            {children}
        </PageLayout>
    );
}
