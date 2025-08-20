"use client";

import React from "react";
import styles from "./AnnualTopActions.module.css";
import DynamicInputSelect from "@/components/ui/InputSelect/DynamicInputSelect";
import { useAnnualTable } from "@/context/AnnualTableContext";

const AnnualTopActions: React.FC = () => {
    const { classesSelectOptions, selectedClassId, handleClassChange, isLoading } =
        useAnnualTable();

    return (
        <section className={styles.actionsContainer}>
            <DynamicInputSelect
                options={classesSelectOptions()}
                value={selectedClassId}
                onChange={handleClassChange}
                isSearchable={false}
                placeholder="בחר כיתה..."
                hasBorder
            />
            {isLoading ? <div>שומר...</div> : null}
        </section>
    );
};

export default AnnualTopActions;
