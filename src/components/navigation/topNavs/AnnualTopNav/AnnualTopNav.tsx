"use client";

import TopNavLayout from "@/components/layout/TopNavLayout/TopNavLayout";
import router from "@/routes";
import styles from "./AnnualTopNav.module.css";
import { useAnnualTable } from "@/context/AnnualTableContext";
import DynamicInputSelect from "@/components/ui/select/InputSelect/DynamicInputSelect";
//NOT IN USE
const AnnualTopNav: React.FC = () => {
    const { classesSelectOptions, selectedClassId, handleClassChange, isSaving, isLoading } =
        useAnnualTable();

    return (
        <TopNavLayout
            type="private"
            elements={{
                topRight: (
                    <div className={styles.rightContainer}>
                        <div>{router.annualSchedule.title}</div>
                        <div className={styles.selectClass}>
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
                    </div>
                ),
            }}
        />
    );
};

export default AnnualTopNav;
