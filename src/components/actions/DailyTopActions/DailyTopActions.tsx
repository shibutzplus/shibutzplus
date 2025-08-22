"use client";

import React from "react";
import styles from "./DailyTopActions.module.css";
import DynamicInputSelect from "@/components/ui/InputSelect/DynamicInputSelect";
import { useDailyTableContext } from "@/context/DailyTableContext";
import { ActionColumnType } from "@/models/types/table";
import { BsMegaphoneFill, BsCalendar4Event, BsPersonFillAdd } from "react-icons/bs";
import { MdPersonAdd } from "react-icons/md";





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
    const { addNewColumn, daysSelectOptions, selectedDate, handleDayChange } =
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
                    style={{ borderLeft: "4px solid #3498db", color: "#3498db" }}
                    func={() => addNewColumn("existingTeacher")}
                />

                <ActionBtn
                    type="event"
                    Icon={<BsCalendar4Event size={16} />}
                    label="מידע"
                    style={{ borderLeft: "4px solid #27ae60", color: "#27ae60" }}
                    func={() => addNewColumn("event")}
                />

                <ActionBtn
                    type="missingTeacher"
                    Icon={<MdPersonAdd size={16} />}
                    label="מורה חסר"
                    style={{ borderLeft: "4px solid #aeac27", color: "#aeac27" }}
                    func={() => addNewColumn("missingTeacher")}
                />

                <div className={styles.spacer} />

                <ActionBtn
                    type="publish"
                    Icon={<BsMegaphoneFill size={16} />}
                    label="פרסום"
                    style={{ borderLeft: "4px solid #6827ae", color: "#6d27ae" }}
                    func={() => {}}
                />
            </div>
        </section>
    );
};

export default DailyTopActions;
