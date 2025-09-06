"use client";

import React from "react";
import styles from "./HistoryTopActions.module.css";
import DynamicInputSelect from "@/components/ui/select/InputSelect/DynamicInputSelect";
import { useHistoryTable } from "@/context/HistoryTableContext";

const HistoryTopActions: React.FC = () => {
  const {
    selectedYear,
    selectedMonth,
    selectedDay,
    yearOptions,
    monthOptions,
    dayOptions,
    handleYearChange,
    handleMonthChange,
    handleDayChange,
  } = useHistoryTable();

  return (
    <section className={styles.actionsContainer}>
      {/* hidden year select for future use */}
      <div className={`${styles.selectContainer} ${styles.yearSelect}`} hidden>
        <DynamicInputSelect
          options={yearOptions}
          value={selectedYear}
          onChange={handleYearChange}
          isSearchable={false}
          placeholder="בחר שנה"
          hasBorder
        />
      </div>


      <div className={`${styles.selectContainer} ${styles.monthSelect}`}>
        <DynamicInputSelect
          options={monthOptions}
          value={selectedMonth}
          onChange={handleMonthChange}
          isSearchable={false}
          placeholder="בחר חודש"
          hasBorder
        />
      </div>

      <div className={`${styles.selectContainer} ${styles.daySelect}`}>
        <DynamicInputSelect
          options={dayOptions}
          value={selectedDay}
          onChange={handleDayChange}
          isSearchable={false}
          placeholder="בחר יום"
          hasBorder
        />
      </div>
    </section>
  );
};

export default HistoryTopActions;
