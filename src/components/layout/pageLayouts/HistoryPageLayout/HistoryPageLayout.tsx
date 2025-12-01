"use client";

import React, { useState } from "react";
import styles from "./HistoryPageLayout.module.css";
import InputDate from "@/components/ui/inputs/InputDate/InputDate";
import router from "@/routes";
import PageLayout from "../../PageLayout/PageLayout";

type HistoryPageLayoutProps = {
    children: React.ReactNode;
};

export default function HistoryPageLayout({ children }: HistoryPageLayoutProps) {
    return (
        <PageLayout
            appType="private"
            leftSideWidth={40}
            HeaderRightActions={
                <>
                    <h3>{router.history.title}</h3>
                    <div className={styles.selectContainer}>
                        <InputDate />
                    </div>
                </>
            }
        >
            {children}
        </PageLayout>
    );
}
