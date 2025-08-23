"use client";

import React from "react";
import styles from "./AnnualTopActions.module.css";
import DynamicInputSelect from "@/components/ui/InputSelect/DynamicInputSelect";
import { useAnnualTable } from "@/context/AnnualTableContext";
import Link from "next/link";
import router from "@/routes";

const AnnualTopActions: React.FC = () => {
    const { classesSelectOptions, selectedClassId, handleClassChange, isSaving, isLoading } =
        useAnnualTable();

    return (
        <section className={styles.actionsContainer}>
            <div className={styles.selectContainer}>
                <DynamicInputSelect
                    options={classesSelectOptions()}
                    value={selectedClassId}
                    onChange={handleClassChange}
                    isSearchable={false}
                    placeholder="בחר כיתה..."
                    hasBorder
                />
            </div>
            <Link href={router.classes.p} className={styles.link}>
                רשימת כיתות
            </Link>
            <Link href={router.teachers.p} className={styles.link}>
                רשימת מורים
            </Link>
            <Link href={router.subjects.p} className={styles.link}>
                רשימת מקצועות
            </Link>

            <br />
            {isSaving ? <div className={styles.loading}>שומר...</div> : null}
            {isLoading ? <div className={styles.loading}>טוען...</div> : null}
        </section>
    );
};

export default AnnualTopActions;
