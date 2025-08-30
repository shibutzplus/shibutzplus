"use client"

import React from "react";
import styles from "./DailyTopActions.module.css";
import DynamicInputSelect from "@/components/ui/select/InputSelect/DynamicInputSelect";
import { useDailyTableContext } from "@/context/DailyTableContext";
import { DailyTableColors } from "@/style/tableColors";
import Icons from "@/style/icons";
import ActionBtn from "@/components/ui/buttons/ActionBtn/ActionBtn";
import usePublish from "@/hooks/usePublish";
import IconBtn from "@/components/ui/buttons/IconBtn/IconBtn";

const DailyTopActions: React.FC = () => {
  const { isLoading, addNewColumn, daysSelectOptions, selectedDate, handleDayChange } =
    useDailyTableContext();
  const { publishDailySchedule, isLoading: publishLoading, onCopyLink } = usePublish();

  return (
    <section className={styles.actionsContainer}>

      {/* Date selector */}
      <div className={styles.selectContainer}>
        <DynamicInputSelect
          options={daysSelectOptions()}
          value={selectedDate}
          isDisabled={isLoading}
          onChange={handleDayChange}
          isSearchable={false}
          placeholder="בחר יום..."
          hasBorder
        />
      </div>

      {/* Desktop buttons with labels */}
      <div className={styles.topButtonsContainer}>
        <ActionBtn
          type="missingTeacher"
          Icon={<Icons.addTeacher size={16} />}
          label="שיבוץ למורה חסר"
          isDisabled={isLoading}
          style={{
            borderLeft: DailyTableColors.missingTeacher.borderLeft,
            color: DailyTableColors.missingTeacher.color,
          }}
          func={() => addNewColumn("missingTeacher")}
        />


        <ActionBtn
          type="event"
          Icon={<Icons.event size={16} />}
          label="עדכון ארועים"
          isDisabled={isLoading}
          style={{
            borderLeft: DailyTableColors.event.borderLeft,
            color: DailyTableColors.event.color,
          }}
          func={() => addNewColumn("event")}
        />
      </div>
      <div className={styles.leftSide}>
        <IconBtn
          Icon={<Icons.link size={16} />}
          onClick={onCopyLink}
          disabled={publishLoading}
          hasBorder
        />
        <ActionBtn
          type="publish"
          Icon={<Icons.publish size={16} />}
          label="פרסום מערכת"
          isDisabled={publishLoading}
          func={publishDailySchedule}
          style={{
            borderLeft: DailyTableColors.publish.borderLeft,
            color: DailyTableColors.publish.color,
          }}
        />
      </div>
    </section>
  );
};

export default DailyTopActions
