"use client";

import React, { useEffect, useState } from "react";
import styles from "./PublicTopNav.module.css";
import Logo from "../../core/Logo/Logo";
import { usePublicPortal } from "@/context/PublicPortalContext";
import DynamicInputSelect from "@/components/ui/select/InputSelect/DynamicInputSelect";
import { usePathname } from "next/navigation";
import { getPageTitleFromUrl } from "@/utils/format";
import PortalTopActions from "@/components/actions/PortalTopActions/PortalTopActions";

const PublicTopNav: React.FC = () => {
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
    } = usePublicPortal();

    const handleSwitchReadAndWrite = () => {
        switchReadAndWrite();
    };

    return (
        <header className={styles.contentHeader}>
            <div className={styles.headerRight}>
                <h2 className={styles.routeTitle}>{pageTitle}</h2>
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
