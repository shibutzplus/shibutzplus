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

    const { classes, teachers, subjects, settings } = useMainContext();

    const handleNextClass = () => {
        const options = classesSelectOptions();
        if (options.length === 0) return;

        const currentIndex = options.findIndex((opt) => opt.value === selectedClassId);
        const nextIndex = (currentIndex + 1) % options.length;
        const nextClassId = options[nextIndex].value;

        handleClassChange(nextClassId);
    };

    const handlePrevClass = () => {
        const options = classesSelectOptions();
        if (options.length === 0) return;

        const currentIndex = options.findIndex((opt) => opt.value === selectedClassId);
        const prevIndex = (currentIndex - 1 + options.length) % options.length;
        const prevClassId = options[prevIndex].value;

        handleClassChange(prevClassId);
    };

    const handleNextTeacher = () => {
        const options = teachersSelectOptions();
        if (options.length === 0) return;

        const currentIndex = options.findIndex((opt) => opt.value === selectedTeacherId);
        const nextIndex = (currentIndex + 1) % options.length;
        const nextTeacherId = options[nextIndex].value;

        handleTeacherChange(nextTeacherId);
    };

    const handlePrevTeacher = () => {
        const options = teachersSelectOptions();
        if (options.length === 0) return;

        const currentIndex = options.findIndex((opt) => opt.value === selectedTeacherId);
        const prevIndex = (currentIndex - 1 + options.length) % options.length;
        const prevTeacherId = options[prevIndex].value;

        handleTeacherChange(prevTeacherId);
    };

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
                    <div className={styles.selectWithAction}>
                        <div className={styles.selectWrapper}>
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
                        <button
                            type="button"
                            className={styles.nextButton}
                            onClick={handlePrevClass}
                            disabled={isLoading || classesSelectOptions().length === 0}
                            title="כיתה קודמת"
                            aria-label="כיתה קודמת"
                        >
                            <Icons.caretRight size={24} />
                        </button>
                        <button
                            type="button"
                            className={styles.nextButton}
                            onClick={handleNextClass}
                            disabled={isLoading || classesSelectOptions().length === 0}
                            title="כיתה הבאה"
                            aria-label="כיתה הבאה"
                        >
                            <Icons.caretLeft size={24} />
                        </button>
                    </div>
                    <div className={styles.selectWithAction}>
                        <div className={styles.selectWrapper}>
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
                        <button
                            type="button"
                            className={styles.nextButton}
                            onClick={handlePrevTeacher}
                            disabled={isLoading || teachersSelectOptions().length === 0}
                            title="מורה קודם"
                            aria-label="מורה קודם"
                        >
                            <Icons.caretRight size={24} />
                        </button>
                        <button
                            type="button"
                            className={styles.nextButton}
                            onClick={handleNextTeacher}
                            disabled={isLoading || teachersSelectOptions().length === 0}
                            title="מורה הבא"
                            aria-label="מורה הבא"
                        >
                            <Icons.caretLeft size={24} />
                        </button>
                    </div>
                    <div className={styles.pdfContainer}>
                        {pdfDownloadButton}
                    </div>
                </>
            }
            BottomActions={
                <div className={styles.bar2Container}>
                    <div className={styles.bar2SelectWrapper}>
                        <div className={styles.selectWrapper}>
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
                        <button
                            type="button"
                            className={styles.nextButton}
                            onClick={handlePrevClass}
                            disabled={isLoading || classesSelectOptions().length === 0}
                            title="כיתה קודמת"
                            aria-label="כיתה קודמת"
                        >
                            <Icons.caretRight size={24} />
                        </button>
                        <button
                            type="button"
                            className={styles.nextButton}
                            onClick={handleNextClass}
                            disabled={isLoading || classesSelectOptions().length === 0}
                            title="כיתה הבאה"
                            aria-label="כיתה הבאה"
                        >
                            <Icons.caretLeft size={24} />
                        </button>
                    </div>
                    <div className={styles.bar2SelectWrapper}>
                        <div className={styles.selectWrapper}>
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
                        <button
                            type="button"
                            className={styles.nextButton}
                            onClick={handlePrevTeacher}
                            disabled={isLoading || teachersSelectOptions().length === 0}
                            title="מורה קודם"
                            aria-label="מורה קודם"
                        >
                            <Icons.caretRight size={24} />
                        </button>
                        <button
                            type="button"
                            className={styles.nextButton}
                            onClick={handleNextTeacher}
                            disabled={isLoading || teachersSelectOptions().length === 0}
                            title="מורה הבא"
                            aria-label="מורה הבא"
                        >
                            <Icons.caretLeft size={24} />
                        </button>
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
