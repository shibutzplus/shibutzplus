"use client";

import React from "react";
import styles from "./PublicTopNav.module.css";
import Logo from "../../core/Logo/Logo";
import { usePublicPortal } from "@/context/PublicPortalContext";
import DynamicInputSelect from "@/components/ui/select/InputSelect/DynamicInputSelect";

const PublicTopNav: React.FC = () => {
    const { teacher, selectedDate, isLoading, publishDatesOptions, handleDayChange } =
        usePublicPortal();

    return (
        <header className={styles.contentHeader}>
            <div className={styles.headerRight}>
                {/* {pageTitle === router.dailyScheduleReadonly.title ? (
                    <Link href={`${router.teacherPortal.p}/${teacher?.id}`}>מערכת אישית</Link>
                ) : (
                    <Link href={router.dailyScheduleReadonly.p}>מערכת יומית</Link>
                )}
                <br /> */}
                {/* <h2 className={styles.routeTitle}>{pageTitle}</h2> */}
                <div className={styles.headerTitle}>
                    <h3>שלום {teacher?.name}</h3>
                    <div>כאן אפשר לראות מי מחליף אותך ולהשאיר לו החומרי לימוד</div>
                </div>
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
            <div className={styles.headerLeft}>
                <Logo size="S" />
            </div>
        </header>
    );
};

export default PublicTopNav;
