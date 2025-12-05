"use client";

import React from "react";
import styles from "./AnnualViewPageLayout.module.css";
import DynamicInputSelect from "@/components/ui/select/InputSelect/DynamicInputSelect";
import { useAnnualView } from "@/context/AnnualViewContext";
import PageLayout from "../../PageLayout/PageLayout";

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
                    <h3 className={styles.pageTitle}>מערכת שנתית</h3>
                    <div className={styles.selectContainer}>
                        <DynamicInputSelect
                            options={classesSelectOptions()}
                            value={selectedClassId}
                            onChange={handleClassChange}
                            isSearchable={true}
                            isDisabled={isLoading}
                            placeholder="בחר כיתה..."
                            hasBorder
                            isClearable
                        />
                    </div>
                    <div className={styles.selectContainer}>
                        <DynamicInputSelect
                            options={teachersSelectOptions()}
                            value={selectedTeacherId}
                            onChange={handleTeacherChange}
                            isSearchable={true}
                            isDisabled={isLoading}
                            placeholder="בחר מורה..."
                            hasBorder
                            isClearable
                        />
                    </div>
                </>
            }
            BottomActions={
                <div className={styles.bottomNav}>
                    <div className={styles.mobileSelectContainer}>
                        <DynamicInputSelect
                            options={classesSelectOptions()}
                            value={selectedClassId}
                            onChange={handleClassChange}
                            isSearchable={false}
                            isDisabled={isLoading}
                            placeholder="בחר כיתה..."
                            hasBorder
                            isClearable
                        />
                    </div>
                    <div className={styles.mobileSelectContainer}>
                        <DynamicInputSelect
                            options={teachersSelectOptions()}
                            value={selectedTeacherId}
                            onChange={handleTeacherChange}
                            isSearchable={true}
                            isDisabled={isLoading}
                            placeholder="בחר מורה..."
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
