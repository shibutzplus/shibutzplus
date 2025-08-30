"use client";

import React, { useEffect, useState } from "react";
import styles from "./PortalTopActions.module.css";
import DynamicInputSelect from "@/components/ui/select/InputSelect/DynamicInputSelect";
import { useAnnualTable } from "@/context/AnnualTableContext";
import Btn from "@/components/ui/buttons/Btn/Btn";
import Icons from "@/style/icons";
import { usePathname } from "next/navigation";
import { getPageTitleFromUrl } from "@/utils/format";
import { usePublicPortal } from "@/context/PublicPortalContext";

const PortalTopActions: React.FC = () => {
    const pathname = usePathname();
    const [pageTitle, setPageTitle] = useState<string>("");

    useEffect(() => {
        const routeKey = getPageTitleFromUrl(pathname);
        if (routeKey) setPageTitle(routeKey);
    }, [pathname]);

    const {
        switchReadAndWrite,
        onReadTable,
        selectedDate,
        isLoading,
        publishDatesOptions,
        handleDayChange,
        isSaving,
        handleSave,
    } = usePublicPortal();

    // Force-write mode (for entering materials)
    const goWriteMode = () => {
        if (onReadTable) switchReadAndWrite();
    };

    // Force-read mode (my daily schedule)
    const goMySchedule = () => {
        if (!onReadTable) switchReadAndWrite();
    };

    // Temporary alert for school-wide view
    const goSchoolView = () => {
        alert("תצוגת מערכת בית ספרית תתווסף בהמשך");
    };

    const onSave = (e: React.MouseEvent) => {
        e.preventDefault();
        handleSave();
    };

    return (
        <section className={styles.actionsContainer}>
            <div className={styles.selectContainer}>
                <DynamicInputSelect
                    options={publishDatesOptions}
                    value={selectedDate}
                    isDisabled={isLoading}
                    onChange={handleDayChange}
                    isSearchable={false}
                    placeholder="בחר יום..."
                    hasBorder
                />
            </div>

            <div className={styles.topButtonsContainer}>
                <button
                    type="button"
                    onClick={goWriteMode}
                    className={`${styles.topBtn} ${!onReadTable ? styles.active : ""}`}
                >
                    <Icons.plus size={16} style={{ marginInlineEnd: "4px" }} />
                    הזנת חומרי לימוד
                </button>

                <span className={styles.separator}>|</span>

                <button
                    type="button"
                    onClick={goMySchedule}
                    className={`${styles.topBtn} ${onReadTable ? styles.active : ""}`}
                >
                    <Icons.Teacher size={16} style={{ marginInlineEnd: "4px" }} />
                    המערכת שלי
                </button>

                <span className={styles.separator}>|</span>

                <button
                    type="button"
                    onClick={goSchoolView}
                    className={styles.topBtn}
                >
                    <Icons.calendar size={16} style={{ marginInlineEnd: "4px" }} />
                    מערכת בית ספרית
                </button>
            </div>

            <br />

            <div className={styles.btnContainer}>
                <Btn
                    Icon={<Icons.save />}
                    text={isLoading ? "טוען..." : isSaving ? "שומר..." : "שמור"}
                    isLoading={isSaving || isLoading ? true : false}
                    onClick={onSave}
                />
            </div>
        </section>
    );
};

export default PortalTopActions;
