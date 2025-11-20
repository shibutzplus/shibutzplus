import React from "react";
import styles from "./NotPublishedLayout.module.css";

type NotPublishedLayoutProps = {
    title?: string;
    subTitle?: string;
};

const NotPublishedLayout: React.FC<NotPublishedLayoutProps> = ({ title, subTitle }) => {
    return (
        <section className={styles.noDataMessage}>
            <h3>{title || ""}</h3>
            {subTitle ? <p>{subTitle}</p> : null}
        </section>
    );
};

export default NotPublishedLayout;
