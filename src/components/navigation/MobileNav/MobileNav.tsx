"use client";

import React from "react";
import styles from "./MobileNav.module.css";
import { useDailyTableContext } from "@/context/DailyTableContext";
import ActionBtn from "@/components/ui/buttons/ActionBtn/ActionBtn";
import Icons from "@/style/icons";
import { DailyTableColors } from "@/style/tableColors";
import usePublish from "@/hooks/usePublish";
import IconBtn from "@/components/ui/buttons/IconBtn/IconBtn";

const MobileNav: React.FC = () => {
    const { isLoading, addNewColumn } = useDailyTableContext();
    const { publishDailySchedule, isLoading: publishLoading, onCopyLink } = usePublish();

    return (
        <nav className={styles.mobileNav}>
            <ActionBtn
                type="missingTeacher"
                label="מורה חסר"
                isDisabled={isLoading}
                style={{
                    color: DailyTableColors.missingTeacher.color,
                    backgroundColor: DailyTableColors.missingTeacher.headerColor,
                }}
                func={() => addNewColumn("missingTeacher")}
            />

            <ActionBtn
                type="existingTeacher"
                label="מורה נוכח"
                isDisabled={isLoading}
                style={{
                    color: DailyTableColors.existingTeacher.color,
                    backgroundColor: DailyTableColors.existingTeacher.headerColor,
                }}
                func={() => addNewColumn("existingTeacher")}
            />

            <ActionBtn
                type="event"
                label="ארועים"
                isDisabled={isLoading}
                style={{
                    color: DailyTableColors.event.color,
                    backgroundColor: DailyTableColors.event.headerColor,
                }}
                func={() => addNewColumn("event")}
            />

            <ActionBtn
                Icon={<Icons.publish size={16} />}
                isDisabled={publishLoading}
                func={publishDailySchedule}
                style={{
                    color: DailyTableColors.publish.color,
                }}
            />

            <IconBtn
                Icon={<Icons.share size={16} />}
                onClick={onCopyLink}
                disabled={publishLoading}
            />
        </nav>
    );
};

export default MobileNav;
