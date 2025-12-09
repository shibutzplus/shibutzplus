import React from "react";
import styles from "./NotPublishedLayout.module.css";

type NotPublishedLayoutProps = {
    title: string;
    subTitle: string[];
};

const NotPublishedLayout: React.FC<NotPublishedLayoutProps> = ({ title, subTitle }) => {
    return (
        <div className={styles.noDataMessage}>
            <h3>{title}</h3>
            {subTitle.map((item, index) => (
                <p key={index}>{item}</p>
            ))}
        </div>
    );
};

export default NotPublishedLayout;
