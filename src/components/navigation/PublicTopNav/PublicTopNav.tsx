"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./PublicTopNav.module.css";
import Logo from "../../core/Logo/Logo";
import { usePathname } from "next/navigation";
import { usePublicPortal } from "@/context/PublicPortalContext";
import DynamicInputSelect from "@/components/ui/InputSelect/DynamicInputSelect";
import { SelectOption } from "@/models/types";

const PublicTopNav: React.FC = () => {
    const pathname = usePathname();
    const [pageTitle, setPageTitle] = useState<string>("");
    const { teacher, selectedDate, isLoading, getPublishDateOptions, handleDayChange } =
        usePublicPortal();
    const [options, setOptions] = useState<SelectOption[]>([]);

    const blockRef = useRef<boolean>(true);
    useEffect(() => {
        const fetchOptions = async () => {
            if (teacher) {
                const options = await getPublishDateOptions(teacher.schoolId);
                console.log("options", options)
                setOptions(options || []);
                blockRef.current = false;
            } else {
                setOptions([]);
            }
        };
        blockRef.current && fetchOptions();
    }, [teacher]);

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
                    options={options}
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
