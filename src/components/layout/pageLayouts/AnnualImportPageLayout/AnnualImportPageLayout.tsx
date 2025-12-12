"use client";

import React from "react";
import styles from "./AnnualImportPageLayout.module.css";
import PageLayout from "../../PageLayout/PageLayout";

type AnnualImportPageLayoutProps = {
    children: React.ReactNode;
};

import { useOptionalMainContext } from "@/context/MainContext";

export default function AnnualImportPageLayout({ children }: AnnualImportPageLayoutProps) {
    const context = useOptionalMainContext();
    const schoolName = context?.school?.name || "";

    return (
        <PageLayout
            appType="private"
            HeaderRightActions={
                <h3 className={styles.pageTitle}>ייבוא מערכת שנתית {schoolName && `(${schoolName})`}</h3>
            }
        >
            {children}
        </PageLayout>
    );
}
