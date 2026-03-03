"use client";

import React from "react";
import styles from "../PortalPageLayout/PortalPageLayout.module.css";
import { usePortalContext } from "@/context/PortalContext";
import { greetingTeacher } from "@/utils";
import { AUTO_SWITCH_TIME, getTodayDateString, getTomorrowDateString, getIsraelDateComponents } from "@/utils/time";
import PageLayout from "../../PageLayout/PageLayout";
import { PortalProvider } from "@/context/PortalContext";
import { TeacherTableProvider } from "@/context/TeacherTableContext";
import { TeacherAltTableProvider } from "@/context/TeacherAltTableContext";
import { usePushNotifications } from "@/hooks/usePushNotifications";

type PortalAltPageLayoutProps = {
    children: React.ReactNode;
};

function PortalAltPageLayoutInner({ children }: PortalAltPageLayoutProps) {
    const { teacher, selectedDate, settings } = usePortalContext();
    const { subscribeToPushNotification } = usePushNotifications();

    React.useEffect(() => {
        if (teacher?.schoolId) {
            const { hour, minute } = getIsraelDateComponents();
            const [switchHour, switchMinute] = AUTO_SWITCH_TIME.split(":").map(Number);
            const isAfterSwitch = hour > switchHour || (hour === switchHour && minute >= switchMinute);
            if (isAfterSwitch) {
                subscribeToPushNotification(teacher.schoolId, teacher.id, false);
            }
        }
    }, [teacher?.schoolId, teacher?.id]);

    const getTitle = () => {
        const isToday = selectedDate === getTodayDateString();
        const isTomorrow = selectedDate === getTomorrowDateString();
        const [y, m, d] = selectedDate.split("-");
        const hasDate = Boolean(y && m && d);
        let when = "";
        if (isToday) when = "להיום";
        else if (isTomorrow) when = "למחר";
        else if (hasDate) when = `ל${d}/${m}`;
        return (
            <div className={styles.titleContainer}>
                <div>{greetingTeacher(teacher)}</div>
                <div className={styles.subTitle}>{`מערכת זמן חירום ${when}`}</div>
            </div>
        );
    };

    return (
        <PageLayout
            appType="public"
            hideLogo
            schoolSettings={settings}
            teacher={teacher}
            HeaderRightActions={
                <div className={styles.headerRightContent}>
                    <h3 className={styles.greetingAndName}>
                        {getTitle()}
                    </h3>
                </div>
            }
            HeaderLeftActions={null}
            contentClassName=""
        >
            {children}
        </PageLayout>
    );
}

export default function PortalAltPageLayout({ children }: PortalAltPageLayoutProps) {
    return (
        <PortalProvider>
            <TeacherTableProvider>
                <TeacherAltTableProvider>
                    <PortalAltPageLayoutInner>{children}</PortalAltPageLayoutInner>
                </TeacherAltTableProvider>
            </TeacherTableProvider>
        </PortalProvider>
    );
}
