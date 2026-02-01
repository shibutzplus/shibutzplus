"use client";
import React from "react";
import { useRouter } from "next/navigation";
import router from "@/routes";
import styles from "./NotPublished.module.css";
import { formatTMDintoDMY, DAYS_OF_WEEK_FORMAT } from "@/utils/time";
import { ScreenType } from "@/models/types";

type NotPublishedProps = {
    date?: string;
    text?: string;
    screenType?: ScreenType;
    displayButton?: boolean;
};

const NotPublished: React.FC<NotPublishedProps> = React.memo(({ date, text, screenType, displayButton }) => {
    const route = useRouter();

    const dateTitle = date
        ? `${DAYS_OF_WEEK_FORMAT[new Date(date).getDay()]} (${formatTMDintoDMY(date)})`
        : "";

    return (
        <section className={styles.emptyTable}>
            {dateTitle && <h3 className={styles.dateText}>{dateTitle}</h3>}
            <h3 className={styles.text}>{text}</h3>
            {displayButton && (
                <button
                    className={styles.linkBtn}
                    onClick={() => route.push(router.fullScheduleView.p)}
                >
                    צפייה במערכת הבית ספרית
                </button>
            )}
        </section>
    );
});

NotPublished.displayName = "NotPublished";

export default NotPublished;
