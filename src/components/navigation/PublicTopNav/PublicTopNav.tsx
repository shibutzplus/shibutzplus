"use client";

import React from "react";
import styles from "./PublicTopNav.module.css";
import Logo from "../../core/Logo/Logo";
import PortalTopActions from "@/components/actions/PortalTopActions/PortalTopActions";
import { usePublicPortal } from "@/context/PublicPortalContext";

const PublicTopNav: React.FC = () => {
    const { teacher } = usePublicPortal();

    return (
        <header className={styles.contentHeader}>
            <div className={styles.headerRight}>
                <h2 className={styles.routeTitle}>{teacher ? `שלום ${teacher.name}` : null}</h2>
                <PortalTopActions />
            </div>
            <div className={styles.headerLeft}>
                <Logo size="S" />
            </div>
        </header>
    );
};

export default PublicTopNav;

{
    /* <div className={styles.headerTitle}>
<h3>שלום {teacher?.name}</h3>
<div>כאן אפשר לראות מי מחליף אותך ולהשאיר לו החומרי לימוד</div>
</div> */
}

{
    /* {pageTitle === router.dailyScheduleReadonly.title ? (
                    <Link href={`${router.teacherPortal.p}/${teacher?.id}`}>מערכת אישית</Link>
                ) : (
                    <Link href={router.dailyScheduleReadonly.p}>מערכת יומית</Link>
                )}
                <br /> */
}
