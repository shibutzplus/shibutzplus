import React from "react";
import styles from "./NotPublished.module.css";
import { formatTMDintoDMY, DAYS_OF_WEEK_FORMAT } from "@/utils/time";
import { ScreenType } from "@/models/types";

type NotPublishedProps = {
    date?: string;
    text?: string;
    screenType?: ScreenType;
};

const NotPublished: React.FC<NotPublishedProps> = ({ date, text, screenType }) => {
    const dateTitle = date
        ? `${DAYS_OF_WEEK_FORMAT[new Date(date).getDay()]} (${formatTMDintoDMY(date)})`
        : "";

    return (
        <section className={styles.emptyTable}>
            {dateTitle && <h3 className={styles.dateText}>{dateTitle}</h3>}
            <h3 className={styles.text}>
                {screenType === "history" ? "אין נתוני היסטוריה ליום שנבחר" : text || "אין שינויים במערכת"}
            </h3>
        </section>
    );
};

export default NotPublished;
