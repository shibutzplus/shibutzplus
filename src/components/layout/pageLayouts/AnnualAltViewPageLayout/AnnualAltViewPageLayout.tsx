"use client";

import React from "react";
import styles from "./AnnualAltViewPageLayout.module.css";
import DynamicInputSelect from "@/components/ui/select/InputSelect/DynamicInputSelect";
import { useAnnualAltView } from "@/context/AnnualAltViewContext";
import PageLayout from "../../PageLayout/PageLayout";
import router from "@/routes";
import { PDFDownloadLink } from "@react-pdf/renderer";
import AnnualSchedulePdf from "@/components/pdf/AnnualSchedulePdf";
import { useMainContext } from "@/context/MainContext";
import Icons from "@/style/icons";

type AnnualAltViewPageLayoutProps = {
    children: React.ReactNode;
};

export default function AnnualAltViewPageLayout({ children }: AnnualAltViewPageLayoutProps) {
    const {
        classesSelectOptions,
        selectedClassId,
        handleClassChange,
        teachersSelectOptions,
        selectedTeacherId,
        handleTeacherChange,
        isLoading,
        schedule,
    } = useAnnualAltView();

    const { classes, teachers, subjects, settings } = useMainContext();

    const hasSelection = selectedClassId || selectedTeacherId;

    const pdfDownloadButton = (
        <PDFDownloadLink
            document={
                <AnnualSchedulePdf
                    schedule={schedule}
                    selectedClassId={selectedClassId}
                    selectedTeacherId={selectedTeacherId}
                    classes={classes || []}
                    teachers={teachers || []}
                    subjects={subjects || []}
                    fromHour={settings?.fromHour}
                    toHour={settings?.toHour}
                />
            }
            fileName={`shibutzPlus_alt${selectedClassId ? "_" + classes?.find((c) => c.id === selectedClassId)?.name : ""}${selectedTeacherId ? "_" + teachers?.find((t) => t.id === selectedTeacherId)?.name : ""}.pdf`}
            className={`${styles.pdfButton} ${!hasSelection ? styles.pdfButtonDisabled : ""}`}
        >
            <Icons.toPDF size={24} title="הורד PDF" />
        </PDFDownloadLink>
    );

    return (
        <PageLayout
            appType="private"
            HeaderRightActions={
                <>
                    <h3 className={styles.pageTitle}>{router.annualAltView.title}</h3>
                    <div className={styles.bar1Container}>
                        <DynamicInputSelect
                            options={classesSelectOptions()}
                            value={selectedClassId}
                            onChange={handleClassChange}
                            isSearchable={true}
                            isDisabled={isLoading}
                            placeholder="כיתה..."
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
                    <div className={styles.pdfContainer}>
                        {pdfDownloadButton}
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
                            placeholder="כיתה..."
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
                    {pdfDownloadButton}
                </div>
            }
            HeaderLeftActions={
                <div className={styles.pdfLeftContainer}>
                    {pdfDownloadButton}
                </div>
            }
        >
            {children}
        </PageLayout>
    );
}
