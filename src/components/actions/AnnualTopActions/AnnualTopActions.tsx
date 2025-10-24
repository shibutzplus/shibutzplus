"use client";
// TODO: not in use, need to use teacher select
import React from "react";
import DynamicInputSelect from "@/components/ui/select/InputSelect/DynamicInputSelect";
import { useAnnualTable } from "@/context/AnnualTableContext";
import styles from "./AnnualTopActions.module.css";

const AnnualTopActions: React.FC = () => {
    const { classesSelectOptions, selectedClassId, handleClassChange,
        teachersSelectOptions, selectedTeacherId, handleTeacherChange,
        isSaving, isLoading, } = useAnnualTable();

    return (
        <section className={styles.actionsContainer}>

            <div className={styles.selectClass}>
                <DynamicInputSelect
                    options={classesSelectOptions()}
                    value={selectedClassId}
                    onChange={handleClassChange}
                    isSearchable={false}
                    isDisabled={isSaving || isLoading}
                    placeholder="בחר כיתה..."
                    hasBorder
                    isClearable
                />
            </div>

            <div className={styles.teacherSelect}>
                <DynamicInputSelect
                    options={teachersSelectOptions()}
                    value={selectedTeacherId}
                    onChange={handleTeacherChange}
                    isSearchable
                    isDisabled={isSaving || isLoading}
                    placeholder="בחר מורה..."
                    hasBorder
                    isClearable
                />
            </div>

        </section>
    );
};

export default AnnualTopActions;
