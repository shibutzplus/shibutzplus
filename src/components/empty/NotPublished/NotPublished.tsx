"use client";
import React from "react";
import { useRouter } from "next/navigation";
import router from "@/routes";
import styles from "./NotPublished.module.css";
import { formatTMDintoDMY, DAYS_OF_WEEK_FORMAT } from "@/utils/time";
import { usePortalContext } from "@/context/PortalContext";

type NotPublishedProps = {
    date?: string;
    text?: string;
    displayButton?: boolean;
};

const NotPublished: React.FC<NotPublishedProps> = React.memo(({ date, text, displayButton }) => {
    const route = useRouter();
    const { mainPublishTable, selectedDate } = usePortalContext();

    const dateTitle = date
        ? `${DAYS_OF_WEEK_FORMAT[new Date(date).getDay()]} (${formatTMDintoDMY(date)})`
        : "";

    const columnCount = Object.keys(mainPublishTable[selectedDate] || {}).length;

    const handleSchoolChangesClick = () => {
        if (columnCount > 13) {
            route.push(router.schoolChanges.p);
        } else {
            route.push(router.schoolChangesFull.p);
        }
    };

    return (
        <section className={styles.emptyTable}>
            {dateTitle && <h3 className={styles.dateText}>{dateTitle}</h3>}
            <h3 className={styles.text}>{text}</h3>
            {displayButton && (
                <button
                    className={styles.linkBtn}
                    onClick={handleSchoolChangesClick}
                >
                    צפייה במערכת בית ספרית
                </button>
            )}
        </section>
    );
});

NotPublished.displayName = "NotPublished";

export default NotPublished;
