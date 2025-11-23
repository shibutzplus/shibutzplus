"use client";

import React, { useEffect, useRef, useState } from "react";
import DynamicInputSelect from "@/components/ui/select/InputSelect/DynamicInputSelect";
import IconBtn from "@/components/ui/buttons/IconBtn/IconBtn";
import Icons from "@/style/icons";
import { usePortal } from "@/context/PortalContext";
import { TeacherRoleValues } from "@/models/types/teachers";
import { usePathname, useRouter } from "next/navigation";
import router from "@/routes";
import { errorToast } from "@/lib/toast";
import styles from "./PortalTopActions.module.css";

const POLL_INTERVAL_MS = 30000; // 30 seconds

const PortalTopActions: React.FC = () => {
    const route = useRouter();
    const pathname = usePathname();
    const {
        teacher, selectedDate, isPortalLoading, publishDatesOptions,
        handleDayChange, fetchPortalScheduleDate, fetchPublishScheduleData, refreshPublishDates,
    } = usePortal();

    // Alert state for incoming updates
    const [hasUpdate, setHasUpdate] = useState(false);
    const [lastTs, setLastTs] = useState<number>(() => Date.now());
    const lastTsRef = useRef<number>(lastTs);
    useEffect(() => { lastTsRef.current = lastTs; }, [lastTs]);

    // Poll changes from daily schedule screen 
    useEffect(() => {
        let mounted = true;
        let id: ReturnType<typeof setInterval> | null = null;

        // on teacher screen, listen to teacher columns events only
        // on schedule screen, listen to both teacher and events columns changes
        const channels = pathname.includes(router.teacherPortal.p) ? "teacher" : "teacher,event";

        const checkUpdates = async () => {
            try {
                const since = lastTsRef.current;
                const res = await fetch(`/api/sync/poll?since=${since}&channels=${encodeURIComponent(channels)}`, { cache: "no-store" });
                if (!res.ok) return;
                const data = await res.json();
                const latest = Number(data?.latestTs || 0);
                if (mounted && latest > since) {
                    errorToast("יש עדכונים חדשים – יש ללחוץ על כפתור הרענון האדום שבסרגל העליון כדי לראותם", 100000);
                    setHasUpdate(true);
                    setLastTs(latest);
                }
            } catch { }
        };

        id = setInterval(checkUpdates, POLL_INTERVAL_MS);

        // Pause polling when tab/browser is not visible
        const handleVisibility = () => {
            if (document.hidden) { if (id) clearInterval(id); }
            else { checkUpdates(); id = setInterval(checkUpdates, POLL_INTERVAL_MS); }
        };
        document.addEventListener("visibilitychange", handleVisibility);

        return () => {
            mounted = false;
            if (id) clearInterval(id);
            document.removeEventListener("visibilitychange", handleVisibility);
        };
    }, [pathname]);


    // Reset polling state on path change as we already get new data from DB
    useEffect(() => {
        setHasUpdate(false);
        setLastTs(Date.now());
    }, [pathname]);

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

        if ((!response.success && response.error !== "") || (!datesRes.success && datesRes.error !== "")) {
            errorToast("בעיה בטעינת המידע, נסו שוב");
            return;
        }

        // reset update badge after successful refresh
        setHasUpdate(false);
        setLastTs(Date.now());
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
                        placeholder="בחרו יום..."
                        hasBorder
                    />
                </div>

                <div className={`${styles.refreshContainer} ${hasUpdate ? styles.refreshAlert : ""}`}>
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
