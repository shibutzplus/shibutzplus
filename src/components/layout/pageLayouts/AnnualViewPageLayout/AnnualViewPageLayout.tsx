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
import { usePopup, PopupAction } from "@/context/PopupContext";
import AnnualScheduleInfoPopup from "@/components/popups/AnnualScheduleInfoPopup/AnnualScheduleInfoPopup";
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
        isAlt,
        annualScheduleTable,
    } = useAnnualView();

    const { classes, teachers, subjects, settings } = useMainContext();
    const { openPopup } = usePopup();

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

    const hasSelection = Boolean(selectedClassId || selectedTeacherId);

    const selectedClass = classes?.find((c) => c.id === selectedClassId);
    // Pedagogical stats popup is relevant only for regular classes (excluding activities / study groups)
    const isOrganicClassSelected = Boolean(selectedClass && !selectedClass.activity);

    const handleOpenClassInfo = () => {
        if (!isOrganicClassSelected || !selectedClassId) return;

        // Clear teacher selection if selected
        if (selectedTeacherId) {
            handleTeacherChange("");
        }

        openPopup(
            PopupAction.annualScheduleInfo,
            "M",
            <AnnualScheduleInfoPopup
                classes={classes || []}
                subjects={subjects || []}
                annualScheduleTable={annualScheduleTable || []}
                initialClassId={selectedClassId}
                mode="class"
                onClassChange={handleClassChange}
            />
        );
    };

    const handleOpenTeacherInfo = () => {
        if (!selectedTeacherId) return;

        // Clear class selection if selected
        if (selectedClassId) {
            handleClassChange("");
        }

        openPopup(
            PopupAction.annualScheduleInfo,
            "M",
            <AnnualScheduleInfoPopup
                teachers={teachers || []}
                classes={classes || []}
                subjects={subjects || []}
                annualScheduleTable={annualScheduleTable || []}
                initialTeacherId={selectedTeacherId}
                mode="teacher"
                onTeacherChange={handleTeacherChange}
            />
        );
    };

    const pdfDownloadButton = (
        <PDFDownloadLink
            key={`pdf_${selectedClassId}_${selectedTeacherId}_${annualScheduleTable?.length || 0}`}
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
            fileName={`shibutzPlus${isAlt ? "_alt" : ""}${selectedClassId ? "_" + classes?.find((c) => c.id === selectedClassId)?.name : ""}${selectedTeacherId ? "_" + teachers?.find((t) => t.id === selectedTeacherId)?.name : ""}.pdf`}
            className={`${styles.pdfButton} ${!hasSelection ? styles.pdfButtonDisabled : ""}`}
        >
            <Icons.toPDF size={24} title="קובץ PDF" />
        </PDFDownloadLink>
    );

    const classInfoButton = (
        <button
            type="button"
            className={`${styles.infoInlineButton} ${!isOrganicClassSelected ? styles.infoInlineButtonDisabled : ""}`}
            onClick={handleOpenClassInfo}
            disabled={isLoading || !isOrganicClassSelected}
            title="מידע על הכיתה"
            aria-label="מידע על הכיתה"
        >
            <Icons.info size={18} />
        </button>
    );

    const teacherInfoButton = (
        <button
            type="button"
            className={`${styles.infoInlineButton} ${!selectedTeacherId ? styles.infoInlineButtonDisabled : ""}`}
            onClick={handleOpenTeacherInfo}
            disabled={isLoading || !selectedTeacherId}
            title="מידע על המורה"
            aria-label="מידע על המורה"
        >
            <Icons.info size={18} />
        </button>
    );

    return (
        <PageLayout
            appType="private"
            HeaderRightActions={
                <>
                    <h3 className={styles.pageTitle}>{isAlt ? router.annualAltView.title : router.annualView.title}</h3>
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
                        {classInfoButton}
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
                        {teacherInfoButton}
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
                        {classInfoButton}
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
                        {teacherInfoButton}
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
