import React from "react";
import styles from "./NotPublished.module.css";

const NotPublished: React.FC = () => {
    return (
        <section className={styles.emptyTable}>
            <h3 className={styles.text}>אין שינויים במערכת</h3>
        </section>
    );
};

export default NotPublished;
