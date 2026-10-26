"use client";

import React from "react";
import styles from "./TutoringReportPageLayout.module.css";
import PageLayout from "../../PageLayout/PageLayout";
import router from "@/routes";

type TutoringReportPageLayoutProps = {
    children: React.ReactNode;
};

export default function TutoringReportPageLayout({
    children,
}: TutoringReportPageLayoutProps) {
    return (
        <PageLayout
            appType="private"
            HeaderRightActions={
                <h3 className={styles.pageTitle}>{router.tutoringReport.title}</h3>
            }
        >
            {children}
        </PageLayout>
    );
}
