"use client";

import React from "react";
import styles from "./MobileNav.module.css";
import { useDailyTableContext } from "@/context/DailyTableContext";
import ActionBtn from "@/components/ui/buttons/ActionBtn/ActionBtn";
import { DailyTableColors } from "@/style/tableColors";
import usePublish from "@/hooks/usePublish";

const MobileNav: React.FC = () => {
    const { isLoading, addNewColumn } = useDailyTableContext();
    const { publishDailySchedule, isLoading: publishLoading } = usePublish();

    return (
        <nav className={styles.mobileNav}>
            <ActionBtn
                type="missingTeacher"
                label="שיבוץ למורה חסר"
                isDisabled={isLoading}
                style={{
                    color: DailyTableColors.missingTeacher.color,
                    backgroundColor: DailyTableColors.missingTeacher.headerColor,
                }}
                func={() => addNewColumn("missingTeacher")}
            />

            <ActionBtn
                type="existingTeacher"
                label="שינוי למורה נוכח"
                isDisabled={isLoading}
                style={{
                    color: DailyTableColors.existingTeacher.color,
                    backgroundColor: DailyTableColors.existingTeacher.headerColor,
                }}
                func={() => addNewColumn("existingTeacher")}
            />

            <ActionBtn
                type="event"
                label="עדכון ארועים"
                isDisabled={isLoading}
                style={{
                    color: DailyTableColors.event.color,
                    backgroundColor: DailyTableColors.event.headerColor,
                }}
                func={() => addNewColumn("event")}
            />

            <ActionBtn
                type="publish"
                label="פרסום מערכת"
                isDisabled={publishLoading}
                func={publishDailySchedule}
                style={{
                    color: DailyTableColors.publish.color,
                }}
            />
        </nav>
    );
};

export default MobileNav;
