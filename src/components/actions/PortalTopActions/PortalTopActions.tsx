"use client";

import React from "react";
import DynamicInputSelect from "@/components/ui/select/InputSelect/DynamicInputSelect";
import IconBtn from "@/components/ui/buttons/IconBtn/IconBtn";
import Icons from "@/style/icons";
import { usePortal } from "@/context/PortalContext";
import { TeacherRoleValues } from "@/models/types/teachers";
import { usePathname, useRouter } from "next/navigation";
import router from "@/routes";
import { errorToast } from "@/lib/toast";
// import { usePortalPolling } from "@/hooks/usePortalPolling";
import styles from "./PortalTopActions.module.css";
//NOT IN USE
const PortalTopActions: React.FC = () => {
    const route = useRouter();
    const pathname = usePathname();
    const {
        teacher,
        selectedDate,
        isPortalLoading,
        publishDatesOptions,
        handleDayChange,
        fetchPortalScheduleDate,
        fetchPublishScheduleData,
        refreshPublishDates,
    } = usePortal();

    // const { hasUpdate } = usePortalPolling();

    const pushToTeacherPortalWrite = () => {
        if (teacher) route.push(`${router.teacherPortal.p}/${teacher.schoolId}/${teacher.id}`);
    };

    const pushToDailySchedulePortal = () => {
        route.push(`${router.publishedPortal.p}`);
    };

    const handleRefresh = async () => {
        const datesRes = await refreshPublishDates();

        let response;
        if (pathname.includes(router.teacherPortal.p)) {
            response = await fetchPortalScheduleDate();
        } else {
            response = await fetchPublishScheduleData();
        }

        if (
            (!response.success && response.error !== "") ||
            (!datesRes.success && datesRes.error !== "")
        ) {
            errorToast("בעיה בטעינת המידע, נסו שוב");
            return;
        }

        // reset update badge after successful refresh
        // resetUpdate();
    };

    return (
        <section className={styles.actionsContainer}>
            <div className={styles.selectRefreshContainer}>
                <div className={styles.selectContainer}>
                    <DynamicInputSelect
                        options={publishDatesOptions}
                        value={selectedDate}
                        isDisabled={isPortalLoading}
                        onChange={handleDayChange}
                        isSearchable={false}
                        placeholder="בחר יום..."
                        hasBorder
                    />
                </div>

                <div
                // className={`${styles.refreshContainer} ${hasUpdate ? styles.refreshAlert : ""}`}
                >
                    <IconBtn
                        Icon={<Icons.refresh size={26} />}
                        onClick={handleRefresh}
                        disabled={isPortalLoading}
                        isLoading={isPortalLoading}
                    />
                </div>
            </div>

            {teacher?.role === TeacherRoleValues.REGULAR && (
                <div className={styles.topButtonsContainer}>
                    <button
                        type="button"
                        aria-label="המערכת שלי"
                        onClick={pushToTeacherPortalWrite}
                        className={`${styles.topBtn} ${pathname.includes(router.teacherPortal.p) ? styles.active : ""}`}
                    >
                        {pathname.includes(router.teacherPortal.p) ? (
                            <Icons.teacherSolid size={18} style={{ marginInlineEnd: "4px" }} />
                        ) : (
                            <Icons.teacher size={16} style={{ marginInlineEnd: "4px" }} />
                        )}
                        המערכת שלי
                    </button>

                    <span className={styles.separator}>|</span>

                    <button
                        type="button"
                        aria-label="מערכת בית ספרית"
                        onClick={pushToDailySchedulePortal}
                        className={`${styles.topBtn} ${pathname.includes(router.publishedPortal.p) ? styles.active : ""}`}
                    >
                        {pathname.includes(router.publishedPortal.p) ? (
                            <Icons.calendarFill size={16} style={{ marginInlineEnd: "4px" }} />
                        ) : (
                            <Icons.calendar size={16} style={{ marginInlineEnd: "4px" }} />
                        )}
                        מערכת בית ספרית
                    </button>
                </div>
            )}
        </section>
    );
};

export default PortalTopActions;
