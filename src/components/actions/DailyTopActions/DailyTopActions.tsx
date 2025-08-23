"use client";

import React from "react";
import styles from "./DailyTopActions.module.css";
import DynamicInputSelect from "@/components/ui/InputSelect/DynamicInputSelect";
import { useDailyTableContext } from "@/context/DailyTableContext";
import { DailyTableColors } from "@/style/tableColors";
import Icons from "@/style/icons";
import ActionBtn from "@/components/ui/buttons/ActionBtn/ActionBtn";

const DailyTopActions: React.FC = () => {
    const {
        isLoading,
        addNewColumn,
        daysSelectOptions,
        selectedDate,
        handleDayChange,
        publishDailySchedule,
    } = useDailyTableContext();

    return (
        <section className={styles.actionsContainer}>
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

            <div className={styles.topButtonsContainer}>
                <ActionBtn
                    type="missingTeacher"
                    Icon={<Icons.addTeacher size={16} />}
                    label="מורה חסר"
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
                    label="מורה קיים"
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
                    label="מידע"
                    isDisabled={isLoading}
                    style={{
                        borderLeft: DailyTableColors.event.borderLeft,
                        color: DailyTableColors.event.color,
                    }}
                    func={() => addNewColumn("event")}
                />

                <div className={styles.spacer} />

                <ActionBtn
                    type="publish"
                    Icon={<Icons.publish size={16} />}
                    label="פרסום"
                    isDisabled={isLoading}
                    style={{
                        borderLeft: DailyTableColors.publish.borderLeft,
                        color: DailyTableColors.publish.color,
                    }}
                    func={() => publishDailySchedule()}
                />
            </div>
        </section>
    );
};

export default DailyTopActions;
