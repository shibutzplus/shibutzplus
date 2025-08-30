"use client"

import React from "react"
import styles from "./DailyTopActions.module.css"
import DynamicInputSelect from "@/components/ui/select/InputSelect/DynamicInputSelect"
import { useDailyTableContext } from "@/context/DailyTableContext"
import { DailyTableColors } from "@/style/tableColors"
import Icons from "@/style/icons"
import ActionBtn from "@/components/ui/buttons/ActionBtn/ActionBtn"

const DailyTopActions: React.FC = () => {
  const {
    isLoading,
    addNewColumn,
    daysSelectOptions,
    selectedDate,
    handleDayChange,
    publishDailySchedule,
  } = useDailyTableContext()

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
          type="existingTeacher"
          Icon={<Icons.addTeacher size={16} />}
          label="שינוי למורה נוכח"
          isDisabled={isLoading}
          style={{
            borderLeft: DailyTableColors.existingTeacher.borderLeft,
            color: DailyTableColors.existingTeacher.color,
          }}
          func={() => addNewColumn("existingTeacher")}
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

        <ActionBtn
          type="publish"
          Icon={<Icons.publish size={16} />}
          label="פרסום מערכת"
          isDisabled={isLoading}
          style={{
            borderLeft: DailyTableColors.publish.borderLeft,
            color: DailyTableColors.publish.color,
          }}
          func={() => publishDailySchedule()}
        />
      </div>

      {/* Mobile: icon-only buttons */}
      <div className={styles.topButtonsMobile} aria-label="פעולות מהירות">
        <button
          className={styles.iconBtn}
          title="שיבוץ למורה חסר"
          onClick={() => addNewColumn("missingTeacher")}
          disabled={isLoading}
          style={{ color: DailyTableColors.missingTeacher.color, }}
        >
          <Icons.addTeacher size={18} />
        </button>

        <button
          className={styles.iconBtn}
          title="שינוי למורה נוכח"
          onClick={() => addNewColumn("existingTeacher")}
          disabled={isLoading}
          style={{ color: DailyTableColors.existingTeacher.color, }}
        >
          <Icons.addTeacher size={18} />
        </button>

        <button
          className={styles.iconBtn}
          title="עדכון ארועים"
          onClick={() => addNewColumn("event")}
          disabled={isLoading}
          style={{ color: DailyTableColors.event.color, }}
        >
          <Icons.event size={18} />
        </button>

        <button
          className={styles.iconBtnPrimary}
          title="פרסום מערכת"
          onClick={() => publishDailySchedule()}
          disabled={isLoading}
          style={{ color: DailyTableColors.publish.color, }}
        >
          <Icons.publish size={18} />
        </button>
      </div>
    </section>
  )
}

export default DailyTopActions
