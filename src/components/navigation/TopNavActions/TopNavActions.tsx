import React from "react";
import DynamicInputSelect from "../../ui/InputSelect/DynamicInputSelect";
import routePath from "../../../routes";
import { useTopNav } from "@/context/TopNavContext";
import styles from "./TopNavActions.module.css";
import DailyTableTopBtns from "@/components/dailyScheduleTable/DailyTableTopBtns/DailyTableTopBtns";

type TopNavActionsProps = {
    type: string | null;
};

const TopNavActions: React.FC<TopNavActionsProps> = ({ type }) => {
    const {
        classesSelectOptions,
        daysSelectOptions,
        handleClassChange,
        handleDayChange,
        yearDaysSelectOptions,
        selectedClassId,
        selectedDate,
        selectedYearDate,
        handleYearDayChange,
    } = useTopNav();

    if (!type) return null;
    switch (type) {
        case routePath.dailySchedule.id:
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
                    <DailyTableTopBtns/>
                </section>
            );
        case routePath.annualSchedule.id:
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
                </section>
            );
        case routePath.history.id:
            return (
                <section className={styles.actionsContainer}>
                    <DynamicInputSelect
                        options={yearDaysSelectOptions()}
                        value={selectedYearDate}
                        onChange={handleYearDayChange}
                        isSearchable={false}
                        placeholder="בחר תאריך..."
                        hasBorder
                    />
                </section>
            );
        default:
            return null;
    }
};

export default TopNavActions;
