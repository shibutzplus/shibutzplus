"use client";

import React from "react";
import styles from "./AnnualTopActions.module.css";
import DynamicInputSelect from "@/components/ui/InputSelect/DynamicInputSelect";
import { useAnnualTable } from "@/context/AnnualTableContext";
import Btn from "@/components/ui/buttons/Btn/Btn";
import Icons from "@/style/icons";

const AnnualTopActions: React.FC = () => {
    const {
        classesSelectOptions,
        selectedClassId,
        handleClassChange,
        isSaving,
        isLoading,
        handleSave,
    } = useAnnualTable();

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
            <div className={styles.btnContainer}>
                <Btn
                    Icon={<Icons.save />}
                    text={isLoading ? "טוען..." : isSaving ? "שומר..." : "שמור"}
                    isLoading={isSaving || isLoading ? true : false}
                    onClick={handleSave}
                />
            </div>
        </section>
    );
};

export default AnnualTopActions;
