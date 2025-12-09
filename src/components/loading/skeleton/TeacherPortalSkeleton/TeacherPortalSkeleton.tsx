import React from "react";
import styles from "./TeacherPortalSkeleton.module.css";
const TeacherPortalSkeleton: React.FC = () => {
    return (
        <section className={styles.content}>
            <div className={styles.whiteBox}></div>
        </section>
    );
};

export default TeacherPortalSkeleton;
