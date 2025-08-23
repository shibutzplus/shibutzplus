"use client";

import React from "react";
import styles from "./AnnualTopActions.module.css";
import DynamicInputSelect from "@/components/ui/InputSelect/DynamicInputSelect";
import { useAnnualTable } from "@/context/AnnualTableContext";

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
                    isDisabled={isSaving || isLoading}
                    placeholder="בחר כיתה..."
                    hasBorder
                />
            </div>
            <br />
            {isSaving ? <div className={styles.loading}>שומר...</div> : null}
            {isLoading ? <div className={styles.loading}>טוען...</div> : null}
        </section>
    );
};

export default AnnualTopActions;
