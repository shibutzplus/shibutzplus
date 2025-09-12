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
    const {
        publishDailySchedule,
        isLoading: publishLoading,
        onShareLink,
        btnTitle,
        isDisabled,
    } = usePublish();

    return (
        <nav className={styles.mobileNav}>
            <ActionBtn
                type="missingTeacher"
                label="מורה חסר"
                isDisabled={isLoading}
                style={{ backgroundColor: DailyTableColors.missingTeacher.headerColor }}
                func={() => addNewColumn("missingTeacher")}
            />

            <ActionBtn
                type="existingTeacher"
                label="מורה נוכח"
                isDisabled={isLoading}
                style={{ backgroundColor: DailyTableColors.existingTeacher.headerColor }}
                func={() => addNewColumn("existingTeacher")}
            />

            <ActionBtn
                type="event"
                label="ארועים"
                isDisabled={isLoading}
                style={{ backgroundColor: DailyTableColors.event.headerColor }}
                func={() => addNewColumn("event")}
            />

            {isDisabled ? (
                <span className={styles.publishLabel}>המערכת פורסמה</span>
            ) : (
                <ActionBtn
                    Icon={<Icons.publish size={16} />}
                    isDisabled={publishLoading}
                    func={publishDailySchedule}
                    style={{}}
                />
            )}

            <IconBtn
                Icon={<Icons.share size={16} />}
                onClick={onShareLink}
                disabled={publishLoading}
            />
        </nav>
    );
};

export default MobileNav;
