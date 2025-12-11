"use client";

import React from "react";
import styles from "./AnnualViewPageLayout.module.css";
import DynamicInputSelect from "@/components/ui/select/InputSelect/DynamicInputSelect";
import { useAnnualView } from "@/context/AnnualViewContext";
import PageLayout from "../../PageLayout/PageLayout";
import router from "@/routes";

type AnnualViewPageLayoutProps = {
    children: React.ReactNode;
};

export default function AnnualViewPageLayout({ children }: AnnualViewPageLayoutProps) {
    const {
        classesSelectOptions,
        selectedClassId,
        handleClassChange,
        teachersSelectOptions,
        selectedTeacherId,
        handleTeacherChange,
        isLoading,
    } = useAnnualView();

    return (
        <PageLayout
            appType="private"
            HeaderRightActions={
                <>
                    <h3 className={styles.pageTitle}>{router.annualView.title}</h3>
                    <div className={styles.bar1Container}>
                        <DynamicInputSelect
                            options={classesSelectOptions()}
                            value={selectedClassId}
                            onChange={handleClassChange}
                            isSearchable={true}
                            isDisabled={isLoading}
                            placeholder="כיתה/קבוצה..."
                            hasBorder
                            isClearable
                        />
                    </div>
                    <div className={styles.bar1Container}>
                        <DynamicInputSelect
                            options={teachersSelectOptions()}
                            value={selectedTeacherId}
                            onChange={handleTeacherChange}
                            isSearchable={true}
                            isDisabled={isLoading}
                            placeholder="מורה..."
                            hasBorder
                            isClearable
                        />
                    </div>
                </>
            }
            BottomActions={
                <div className={styles.bar2Container}>
                    <div className={styles.bar2SelectContainer}>
                        <DynamicInputSelect
                            options={classesSelectOptions()}
                            value={selectedClassId}
                            onChange={handleClassChange}
                            isSearchable={false}
                            isDisabled={isLoading}
                            placeholder="כיתה/קבוצה..."
                            hasBorder
                            isClearable
                        />
                    </div>
                    <div className={styles.bar2SelectContainer}>
                        <DynamicInputSelect
                            options={teachersSelectOptions()}
                            value={selectedTeacherId}
                            onChange={handleTeacherChange}
                            isSearchable={true}
                            isDisabled={isLoading}
                            placeholder="מורה..."
                            hasBorder
                            isClearable
                        />
                    </div>
                </div>
            }
        >
            {children}
        </PageLayout>
    );
}
