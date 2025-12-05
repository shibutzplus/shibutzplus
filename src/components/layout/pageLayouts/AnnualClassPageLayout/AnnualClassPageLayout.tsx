"use client";

import React from "react";
import styles from "./AnnualClassPageLayout.module.css";
import DynamicInputSelect from "@/components/ui/select/InputSelect/DynamicInputSelect";
import router from "@/routes";
import { useAnnualByClass } from "@/context/AnnualByClassContext";
import PageLayout from "../../PageLayout/PageLayout";

type AnnualClassPageLayoutProps = {
    children: React.ReactNode;
};

export default function AnnualClassPageLayout({ children }: AnnualClassPageLayoutProps) {
    const { classesSelectOptions, selectedClassId, handleClassChange, isSaving, isLoading } =
        useAnnualByClass();

    return (
        <PageLayout
            appType="private"
            leftSideWidth={50}
            HeaderRightActions={
                <>
                    <h3 className={styles.pageTitle}>{router.annualByClass.title}</h3>
                    <div className={styles.selectContainer}>
                        <DynamicInputSelect
                            options={classesSelectOptions()}
                            value={selectedClassId}
                            onChange={handleClassChange}
                            isSearchable={false}
                            isDisabled={isSaving || isLoading}
                            placeholder="בחר כיתה..."
                            hasBorder
                        />
                    </div>
                </>
            }
            BottomActions={
                <div className={styles.mobileSelectContainer}>
                    <DynamicInputSelect
                        options={classesSelectOptions()}
                        value={selectedClassId}
                        onChange={handleClassChange}
                        isSearchable={false}
                        isDisabled={isSaving || isLoading}
                        placeholder="בחר כיתה..."
                        hasBorder
                    />
                </div>
            }
        >
            {children}
        </PageLayout>
    );
}
