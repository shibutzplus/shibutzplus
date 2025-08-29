"use client";

import React, { useEffect, useState } from "react";
import styles from "./PortalTopActions.module.css";
import DynamicInputSelect from "@/components/ui/select/InputSelect/DynamicInputSelect";
import { useAnnualTable } from "@/context/AnnualTableContext";
import Btn from "@/components/ui/buttons/Btn/Btn";
import Icons from "@/style/icons";
import { usePathname } from "next/navigation";
import { getPageTitleFromUrl } from "@/utils/format";
import { usePublicPortal } from "@/context/PublicPortalContext";

const PortalTopActions: React.FC = () => {
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
        isSaving,
        handleSave
    } = usePublicPortal();

    const handleSwitchReadAndWrite = () => {
        switchReadAndWrite();
    };

    const onSave = (e: React.MouseEvent) => {
        e.preventDefault();
        handleSave()
    }

    return (
        <section className={styles.actionsContainer}>
            <div className={styles.selectContainer}>
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
            <div className={styles.topButtonsContainer}>
                <div onClick={handleSwitchReadAndWrite}>
                    {onReadTable ? "מי מחליף אותי" : "את מי אני מחליף"}
                </div>
            </div>
            <br />
            <div className={styles.btnContainer}>
                <Btn
                    Icon={<Icons.save />}
                    text={isLoading ? "טוען..." : isSaving ? "שומר..." : "שמור"}
                    isLoading={isSaving || isLoading ? true : false}
                    onClick={onSave}
                />
            </div>
        </section>
    );
};

export default PortalTopActions;
