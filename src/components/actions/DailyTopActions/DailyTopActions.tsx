"use client";

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
                    type="missingTeacher"
                    Icon={<Icons.addTeacher size={16} />}
                    label="שיבוץ למורה חסר"
                    isDisabled={isLoading}
                    style={{ borderLeft: DailyTableColors.missingTeacher.borderLeft }}
                    func={() => addNewColumn("missingTeacher")}
                />
                <ActionBtn
                    type="existingTeacher"
                    Icon={<Icons.addTeacher size={16} />}
                    label="שיבוץ למורה נוכח"
                    isDisabled={isLoading}
                    style={{ borderLeft: DailyTableColors.existingTeacher.borderLeft }}
                    func={() => addNewColumn("existingTeacher")}
                />
                <ActionBtn
                    type="event"
                    Icon={<Icons.event size={16} />}
                    label="עדכון ארועים"
                    isDisabled={isLoading}
                    style={{ borderLeft: DailyTableColors.event.borderLeft }}
                    func={() => addNewColumn("event")}
                />
            </div>

            <div className={styles.leftSide}>
                {isDisabled ? (
                    <span className={styles.publishLabel}>המערכת{"\n"}פורסמה</span>
                ) : (
                    <ActionBtn
                        type="publish"
                        Icon={<Icons.publish size={16} />}
                        label={btnTitle}
                        isLoading={publishLoading}
                        isDisabled={publishLoading}
                        func={publishDailySchedule}
                        style={{ borderLeft: DailyTableColors.publish.borderLeft }}
                    />
                )}

                <span className={styles.hideOnMobile}>
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
