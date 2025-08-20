"use client";

import React from "react";
import styles from "./DailyTopActions.module.css";
import DynamicInputSelect from "@/components/ui/InputSelect/DynamicInputSelect";
import DailyTableTopBtns from "@/components/dailyScheduleTable/DailyTableTopBtns/DailyTableTopBtns";
import { useDailyTableContext } from "@/context/DailyTableContext";

const DailyTopActions: React.FC = () => {
    const { daysSelectOptions, selectedDate, handleDayChange } = useDailyTableContext();

    return (
        <section className={styles.actionsContainer}>
            <DynamicInputSelect
                options={daysSelectOptions()}
                value={selectedDate}
                onChange={handleDayChange}
                isSearchable={false}
                placeholder="בחר יום..."
                hasBorder
            />
            <DailyTableTopBtns />
        </section>
    );
};

export default DailyTopActions;
