"use client";

import React from "react";
import styles from "./PortalTopActions.module.css";
import DynamicInputSelect from "@/components/ui/select/InputSelect/DynamicInputSelect";
import Icons from "@/style/icons";
import { usePublicPortal } from "@/context/PublicPortalContext";

const PortalTopActions: React.FC = () => {
    const {
        teacher,
        selectedDate,
        isLoading,
        publishDatesOptions,
        handleDayChange,
        switchReadAndWrite,
        pageMode,
    } = usePublicPortal();

    // // Temporary alert for school-wide view
    // const goSchoolView = () => {
    //     alert("תצוגת מערכת בית ספרית תתווסף בהמשך");
    // };

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
                {teacher?.role === "regular" ? (
                    <button
                        type="button"
                        onClick={() => switchReadAndWrite("write")}
                        className={`${styles.topBtn} ${pageMode === "write" ? styles.active : ""}`}
                    >
                        <Icons.plus size={16} style={{ marginInlineEnd: "4px" }} />
                        הזנת חומרי לימוד
                    </button>
                ) : null}
                <span className={styles.separator}>|</span>

                <button
                    type="button"
                    onClick={() => switchReadAndWrite("read")}
                    className={`${styles.topBtn} ${pageMode === "read" ? styles.active : ""}`}
                >
                    <Icons.teacher1 size={16} style={{ marginInlineEnd: "4px" }} />
                    המערכת שלי
                </button>

                {/* <button type="button" onClick={goSchoolView} className={styles.topBtn}>
                    <Icons.calendar size={16} style={{ marginInlineEnd: "4px" }} />
                    מערכת בית ספרית
                </button> */}
            </div>
        </section>
    );
};

export default PortalTopActions;
