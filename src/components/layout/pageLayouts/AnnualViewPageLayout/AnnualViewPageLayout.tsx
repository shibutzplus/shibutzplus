"use client";

import React, { useState, useEffect, useRef } from "react";
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

type AnnualViewPageLayoutProps = {
    children: React.ReactNode;
};

const ChangeScheduleDropdown: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const nav = useRouter();
    const searchParams = useSearchParams();
    const { selectedClassId, selectedTeacherId } = useAnnualView();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleOptionClick = (path: string) => {
        setIsOpen(false);
        nav.push(path);
    };

    return (
        <div className={styles.dropdownContainer} ref={dropdownRef}>
            <button
                type="button"
                className={styles.dropdownTrigger}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={styles.textLong}>שינוי המערכת</span>
                <span className={styles.textShort}>שינוי</span>
                <Icons.arrowDown
                    size={16}
                    className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
                />
            </button>
            {isOpen && (
                <div className={styles.dropdownMenu}>
                    <button
                        type="button"
                        className={styles.dropdownItem}
                        onClick={() => {
                            const schoolId = searchParams.get("schoolId");
                            const params = new URLSearchParams();
                            if (selectedClassId) params.set("classId", selectedClassId);
                            if (schoolId) params.set("schoolId", schoolId);
                            const qs = params.toString();
                            handleOptionClick(`/annual-build-class${qs ? `?${qs}` : ""}`);
                        }}
                    >
                        לפי כיתה
                    </button>
                    <button
                        type="button"
                        className={styles.dropdownItem}
                        onClick={() => {
                            const schoolId = searchParams.get("schoolId");
                            const params = new URLSearchParams();
                            if (selectedTeacherId) params.set("teacherId", selectedTeacherId);
                            if (schoolId) params.set("schoolId", schoolId);
                            const qs = params.toString();
                            handleOptionClick(`/annual-build-teacher${qs ? `?${qs}` : ""}`);
                        }}
                    >
                        לפי מורה
                    </button>
                </div>
            )}
        </div>
    );
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
                    <div className={styles.desktopDropdownContainer}>
                        <ChangeScheduleDropdown />
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
                    <div className={styles.bar2DropdownContainer}>
                        <ChangeScheduleDropdown />
                    </div>
                    {pdfDownloadButton}
                </div>
            }
            HeaderLeftActions={
                <div className={styles.pdfLeftContainer}>
                    <ChangeScheduleDropdown />
                    {pdfDownloadButton}
                </div>
            }
        >
            {children}
        </PageLayout>
    );
}
