"use client";

import React from "react";
import styles from "./AnnualViewPageLayout.module.css";
import DynamicInputSelect from "@/components/ui/select/InputSelect/DynamicInputSelect";
import { useAnnualView } from "@/context/AnnualViewContext";
import PageLayout from "../../PageLayout/PageLayout";
import router from "@/routes";
import { PDFDownloadLink } from "@react-pdf/renderer";
import AnnualSchedulePdf from "@/components/pdf/AnnualSchedulePdf";
import { useMainContext } from "@/context/MainContext";
import Icons from "@/style/icons";

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
        schedule,
    } = useAnnualView();

    const { classes, teachers, subjects, school } = useMainContext();

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
                    schoolHours={school?.hoursNum}
                />
            }
            fileName={`shibutzPlus${selectedClassId ? "_" + classes?.find((c) => c.id === selectedClassId)?.name : ""}${selectedTeacherId ? "_" + teachers?.find((t) => t.id === selectedTeacherId)?.name : ""}.pdf`}
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
