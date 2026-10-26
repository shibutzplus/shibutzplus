"use client";

import React, { useMemo } from "react";
import TutoringReportPageLayout from "@/components/layout/pageLayouts/TutoringReportPageLayout/TutoringReportPageLayout";
import MngrTutoringReportTable from "@/components/tables/mngrTutoringReport/MngrTutoringReportTable/MngrTutoringReportTable";
import Preloader from "@/components/ui/Preloader/Preloader";
import { useMainContext } from "@/context/MainContext";
import { buildTutoringReportData } from "@/utils/tutoringReportUtils";
import styles from "./page.module.css";

export default function TutoringReportPage() {
    const { classes, teachers, subjects, annualScheduleTable } = useMainContext();

    const reportData = useMemo(() => {
        return buildTutoringReportData(
            annualScheduleTable,
            classes,
            teachers,
            subjects
        );
    }, [annualScheduleTable, classes, teachers, subjects]);

    const isLoading = !classes || !teachers || !subjects || annualScheduleTable === undefined;

    return (
        <TutoringReportPageLayout>
            <div className={styles.container}>
                {isLoading ? (
                    <div className={styles.loaderContainer}>
                        <Preloader />
                    </div>
                ) : (
                    <MngrTutoringReportTable reportData={reportData} />
                )}
            </div>
        </TutoringReportPageLayout>
    );
}
