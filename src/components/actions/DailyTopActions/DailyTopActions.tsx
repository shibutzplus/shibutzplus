"use client";

import React from "react";
import DynamicInputSelect from "@/components/ui/select/InputSelect/DynamicInputSelect";
import ActionBtn from "@/components/ui/buttons/ActionBtn/ActionBtn";
import IconBtn from "@/components/ui/buttons/IconBtn/IconBtn";
import { useDailyTableContext } from "@/context/DailyTableContext";
import usePublish from "@/hooks/usePublish";
import { DailyTableColors } from "@/style/tableColors";
import Icons from "@/style/icons";
import styles from "./DailyTopActions.module.css";
import { ColumnTypeValues } from "@/models/types/dailySchedule";
import { EventColor, ExistingTeacherColor, MissingTeacherColor, PublishColor } from "@/style/colors";

const DailyTopActions: React.FC = () => {
    const { isLoading, addNewColumn, daysSelectOptions, selectedDate, handleDayChange } =
        useDailyTableContext();
    const {
        publishDailySchedule,
        isLoading: publishLoading,
        onShareLink,
        onOpenHistory,
        isDisabled,
        btnTitle,
    } = usePublish();

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
                    type={ColumnTypeValues.missingTeacher}
                    Icon={<Icons.addTeacher size={16} />}
                    label="שיבוץ למורה חסר"
                    isDisabled={isLoading}
                    style={{ borderLeft: `10px solid ${MissingTeacherColor}` }}
                    func={() => addNewColumn(ColumnTypeValues.missingTeacher)}
                />
                <ActionBtn
                    type={ColumnTypeValues.existingTeacher}
                    Icon={<Icons.addTeacher size={16} />}
                    label="שיבוץ למורה נוכח"
                    isDisabled={isLoading}
                    style={{ borderLeft: `10px solid ${ExistingTeacherColor}` }}
                    func={() => addNewColumn(ColumnTypeValues.existingTeacher)}
                />
                <ActionBtn
                    type={ColumnTypeValues.event}
                    Icon={<Icons.event size={16} />}
                    label="שיבוץ ארוע"
                    isDisabled={isLoading}
                    style={{ borderLeft: `10px solid ${EventColor}` }}
                    func={() => addNewColumn(ColumnTypeValues.event)}
                />
            </div>

            <div className={styles.leftSide}>
                <ActionBtn
                    type="publish"
                    label={btnTitle}
                    isLoading={publishLoading}
                    isDisabled={isDisabled}
                    func={publishDailySchedule}
                    Icon={isDisabled ? <Icons.success2 size={17} /> : <Icons.publish size={16} />}
                    style={
                        isDisabled
                            ? {
                                  backgroundColor: "transparent",
                                  border: "1px solid transparent",
                                  boxShadow: "none",
                                  cursor: "default",
                                  pointerEvents: "none",
                              }
                            : {
                                  borderLeft: `10px solid ${PublishColor}`,
                                  borderRight: "1px solid #ddd",
                                  borderBottom: "1px solid #ddd",
                                  borderTop: "1px solid #ddd",
                              }
                    }
                />

                <span className={styles.hideOnMobile} title="תצוגה מקדימה">
                    <IconBtn
                        Icon={<Icons.eye size={24} />}
                        onClick={onOpenHistory}
                        disabled={publishLoading}
                    />
                </span>

                <span title="שיתוף קישור">
                    <IconBtn
                        Icon={<Icons.share size={16} />}
                        onClick={onShareLink}
                        disabled={publishLoading}
                    />
                </span>
            </div>
        </section>
    );
};

export default DailyTopActions;
