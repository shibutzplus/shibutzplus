"use client";

import TopNavLayout from "@/components/layout/TopNavLayout/TopNavLayout";
import router from "@/routes";
import React from "react";
import styles from "./DailyTopNav.module.css";
import { useDailyTableContext } from "@/context/DailyTableContextP";
import usePublish from "@/hooks/usePublish";
import ActionBtn from "@/components/ui/buttons/ActionBtn/ActionBtn";
import { ColumnTypeValues } from "@/models/types/dailySchedule";
import Icons from "@/style/icons";
import DynamicInputSelect from "@/components/ui/select/InputSelect/DynamicInputSelect";
import IconBtn from "@/components/ui/buttons/IconBtn/IconBtn";
import { EventColor, ExistingTeacherColor, MissingTeacherColor } from "@/style/colors";

const DailyTopNav: React.FC = () => {
    const { addNewEmptyColumn, daysSelectOptions, selectedDate, isLoading, handleDayChange } =
        useDailyTableContext();

    // const {
    //     publishDailySchedule,
    //     isLoading: publishLoading,
    //     onShareLink,
    //     onOpenHistory,
    //     isDisabled,
    //     btnTitle,
    // } = usePublish();
    return (
        <TopNavLayout
            type="daily"
            childrens={{
                left: (
                    <div className={styles.leftContainer}>
                        {/* <span title="תצוגה מקדימה">
                            <IconBtn
                                Icon={<Icons.eye size={20} />}
                                onClick={onOpenHistory}
                                disabled={publishLoading}
                            />
                        </span>

                        <span title="פרסום">
                            <IconBtn
                                Icon={<Icons.publish size={20} />}
                                onClick={publishDailySchedule}
                                disabled={isDisabled}
                            />
                        </span>

                        <span title="שיתוף קישור">
                            <IconBtn
                                Icon={<Icons.share size={16} />}
                                onClick={onShareLink}
                                disabled={publishLoading}
                            />
                        </span> */}
                    </div>
                ),
                right: (
                    <div className={styles.rightContainer}>
                        <div>{router.dailySchedule.title}</div>
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

                        <ActionBtn
                            type={ColumnTypeValues.missingTeacher}
                            Icon={<Icons.addTeacher size={16} />}
                            label="שיבוץ למורה חסר"
                            isDisabled={isLoading}
                            style={{ borderLeft: `10px solid ${MissingTeacherColor}` }}
                            func={() => addNewEmptyColumn(ColumnTypeValues.missingTeacher)}
                        />
                        <ActionBtn
                            type={ColumnTypeValues.existingTeacher}
                            Icon={<Icons.addTeacher size={16} />}
                            label="שיבוץ למורה נוכח"
                            isDisabled={isLoading}
                            style={{ borderLeft: `10px solid ${ExistingTeacherColor}` }}
                            func={() => addNewEmptyColumn(ColumnTypeValues.existingTeacher)}
                        />
                        <ActionBtn
                            type={ColumnTypeValues.event}
                            Icon={<Icons.event size={16} />}
                            label="שיבוץ ארוע"
                            isDisabled={isLoading}
                            style={{ borderLeft: `10px solid ${EventColor}` }}
                            func={() => addNewEmptyColumn(ColumnTypeValues.event)}
                        />
                    </div>
                ),
            }}
        />
    );
};

export default DailyTopNav;
