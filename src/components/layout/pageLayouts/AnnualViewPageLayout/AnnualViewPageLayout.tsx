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
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

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
    const nav = useRouter();
    const searchParams = useSearchParams();
    const { data: session } = useSession();
    const isDemo = session?.user?.isDemo;

    const handleEditClassSchedule = () => {
        const schoolId = searchParams.get("schoolId");
        const params = new URLSearchParams();
        if (selectedClassId) params.set("classId", selectedClassId);
        if (schoolId) params.set("schoolId", schoolId);
        const qs = params.toString();
        nav.push(`/annual-build-class${qs ? `?${qs}` : ""}`);
    };

    const handleEditTeacherSchedule = () => {
        const schoolId = searchParams.get("schoolId");
        const params = new URLSearchParams();
        if (selectedTeacherId) params.set("teacherId", selectedTeacherId);
        if (schoolId) params.set("schoolId", schoolId);
        const qs = params.toString();
        nav.push(`/annual-build-teacher${qs ? `?${qs}` : ""}`);
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
                            className={styles.editActionBtn}
                            onClick={handleEditClassSchedule}
                            disabled={isDemo}
                            title="עריכת מערכת כיתה"
                            aria-label="עריכת מערכת כיתה"
                        >
                            <Icons.edit size={18} />
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
                            className={styles.editActionBtn}
                            onClick={handleEditTeacherSchedule}
                            disabled={isDemo}
                            title="עריכת מערכת מורה"
                            aria-label="עריכת מערכת מורה"
                        >
                            <Icons.edit size={18} />
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
                            className={styles.editActionBtn}
                            onClick={handleEditClassSchedule}
                            disabled={isDemo}
                            title="עריכת מערכת כיתה"
                            aria-label="עריכת מערכת כיתה"
                        >
                            <Icons.edit size={18} />
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
                            className={styles.editActionBtn}
                            onClick={handleEditTeacherSchedule}
                            disabled={isDemo}
                            title="עריכת מערכת מורה"
                            aria-label="עריכת מערכת מורה"
                        >
                            <Icons.edit size={18} />
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
