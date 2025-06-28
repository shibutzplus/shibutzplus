import React from "react";
import DynamicInputSelect from "../../ui/InputSelect/DynamicInputSelect";
import routePath from "../../../routes";
import { useActions } from "@/context/ActionsContext";
import styles from "./TopNavSelect.module.css";

type TopNavSelectProps = {
    type: string | null;
};

const TopNavSelect: React.FC<TopNavSelectProps> = ({ type }) => {
    const { setSelectOptions, handleClassChange, selectedClassId } = useActions();

    if (!type) return null;
    switch (type) {
        case routePath.dailySchedule.id:
            return (
                <div className={styles.selectContainer}>
                    <span>בחר יום:</span>
                    <DynamicInputSelect
                        options={setSelectOptions()}
                        value={selectedClassId}
                        onChange={handleClassChange}
                        placeholder="בחר יום..."
                        hasBorder
                    />
                </div>
            );
        case routePath.annualSchedule.id:
            return (
                <div className={styles.selectContainer}>
                    <DynamicInputSelect
                        options={setSelectOptions()}
                        value={selectedClassId}
                        onChange={handleClassChange}
                        placeholder="בחר כיתה..."
                        hasBorder
                    />
                </div>
            );
        default:
            return null;
    }
};

export default TopNavSelect;
