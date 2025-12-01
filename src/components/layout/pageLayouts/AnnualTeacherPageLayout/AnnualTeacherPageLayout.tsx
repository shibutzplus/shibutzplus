"use client";

import React, { useState } from "react";
import styles from "./AnnualTeacherPageLayout.module.css";
import Logo from "@/components/ui/Logo/Logo";
import HamburgerNav, { HamburgerButton } from "@/components/navigation/HamburgerNav/HamburgerNav";
import DynamicInputSelect from "@/components/ui/select/InputSelect/DynamicInputSelect";
import router from "@/routes";
import { useAnnualByTeacher } from "@/context/AnnualByTeacherContext";
import PageLayout from "../../PageLayout/PageLayout";

type AnnualTeacherPageLayoutProps = {
    children: React.ReactNode;
};

export default function AnnualTeacherPageLayout({ children }: AnnualTeacherPageLayoutProps) {
    const { teachersSelectOptions, selectedTeacherId, handleTeacherChange, isSaving, isLoading } =
        useAnnualByTeacher();

    return (
        <PageLayout
            appType="private"
            HeaderRightActions={
                <>
                    <h3 className={styles.pageTitle}>{router.annualByTeacher.title}</h3>
                    <div className={styles.selectContainer}>
                        <DynamicInputSelect
                            options={teachersSelectOptions()}
                            value={selectedTeacherId}
                            onChange={handleTeacherChange}
                            isSearchable={false}
                            isDisabled={isSaving || isLoading}
                            placeholder="בחרו מורה..."
                            hasBorder
                        />
                    </div>
                </>
            }
            BottomActions={
                <div className={styles.mobileSelectContainer}>
                    <DynamicInputSelect
                        options={teachersSelectOptions()}
                        value={selectedTeacherId}
                        onChange={handleTeacherChange}
                        isSearchable={false}
                        isDisabled={isSaving || isLoading}
                        placeholder="בחר מורה..."
                        hasBorder
                    />
                </div>
            }
        >
            {children}
        </PageLayout>
    );
}
