"use client";

import React from "react";
import styles from "./DailyTopActions.module.css";
import DynamicInputSelect from "@/components/ui/InputSelect/DynamicInputSelect";
import { useDailyTableContext } from "@/context/DailyTableContext";
import { ActionColumnType } from "@/models/types/table";
import { BsMegaphoneFill, BsCalendar4Event, BsPersonFillAdd } from "react-icons/bs";
import { MdPersonAdd } from "react-icons/md";
import { DailyTableColors } from "@/style/tableColors";

const ActionBtn: React.FC<{
    type: ActionColumnType;
    Icon: React.ReactNode;
    label: string;
    style: React.CSSProperties;
    func: () => void;
}> = ({ type, Icon, label, style, func }) => (
    <button key={type} style={style} className={styles.topButton} title={label} onClick={func}>
        {Icon}
        <span>{label}</span>
    </button>
);

const DailyTopActions: React.FC = () => {
    const { addNewColumn, daysSelectOptions, selectedDate, handleDayChange, publishDailySchedule } =
        useDailyTableContext();

    return (
        <section className={styles.actionsContainer}>
            <div className={styles.selectContainer}>
                <DynamicInputSelect
                    options={daysSelectOptions()}
                    value={selectedDate}
                    onChange={handleDayChange}
                    isSearchable={false}
                    placeholder="בחר יום..."
                    hasBorder
                />
            </div>

            <div className={styles.topButtonsContainer}>
                <ActionBtn
                    type="existingTeacher"
                    Icon={<MdPersonAdd size={16} />}
                    label="מורה קיים"
                    style={{
                        borderLeft: DailyTableColors.existingTeacher.borderLeft,
                        color: DailyTableColors.existingTeacher.color,
                    }}
                    func={() => addNewColumn("existingTeacher")}
                />

                <ActionBtn
                    type="event"
                    Icon={<BsCalendar4Event size={16} />}
                    label="מידע"
                    style={{
                        borderLeft: DailyTableColors.event.borderLeft,
                        color: DailyTableColors.event.color,
                    }}
                    func={() => addNewColumn("event")}
                />

                <ActionBtn
                    type="missingTeacher"
                    Icon={<MdPersonAdd size={16} />}
                    label="מורה חסר"
                    style={{
                        borderLeft: DailyTableColors.missingTeacher.borderLeft,
                        color: DailyTableColors.missingTeacher.color,
                    }}
                    func={() => addNewColumn("missingTeacher")}
                />

                <div className={styles.spacer} />

                <ActionBtn
                    type="publish"
                    Icon={<BsMegaphoneFill size={16} />}
                    label="פרסום"
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
