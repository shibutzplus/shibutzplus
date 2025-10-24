"use client";

import TopNavLayout from "@/components/layout/TopNavLayout/TopNavLayout";
import router from "@/routes";
import styles from "./AnnualTopNav.module.css";
import { useAnnualTable } from "@/context/AnnualTableContext";
import DynamicInputSelect from "@/components/ui/select/InputSelect/DynamicInputSelect";

const AnnualTopNav: React.FC = () => {
    const { classesSelectOptions, selectedClassId, handleClassChange, isSaving, isLoading } =
        useAnnualTable();

    return (
        <TopNavLayout
            type="annual"
            childrens={{
                left: undefined,
                right: (
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
                                isClearable
                            />
                        </div>
                    </div>
                ),
            }}
        />
    );
};

export default AnnualTopNav;
