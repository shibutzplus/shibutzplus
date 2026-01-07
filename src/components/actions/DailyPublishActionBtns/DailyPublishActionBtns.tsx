import IconBtn from "@/components/ui/buttons/IconBtn/IconBtn";
import Icons from "@/style/icons";
import React from "react";
import styles from "./DailyPublishActionBtns.module.css";
import usePublish from "@/hooks/usePublish";
import Loading from "@/components/loading/Loading/Loading";
import { useDailyTableContext } from "@/context/DailyTableContext";

import useDeletePopup from "@/hooks/useDeletePopup";
import { useSession } from "next-auth/react";
import useGuestModePopup from "@/hooks/useGuestModePopup";

const DailyPublishActionBtns: React.FC = () => {
    const { togglePreviewMode, mainDailyTable, selectedDate } = useDailyTableContext();

    const currentSchedule = mainDailyTable[selectedDate] || {};
    const isEmpty = Object.keys(currentSchedule).length === 0;

    const {
        publishDailySchedule,
        unpublishDailySchedule,
        isLoading: publishLoading,
        onShareLink,
        isDisabled,
    } = usePublish();

    const { handleOpenPopup } = useDeletePopup();
    const { data: session } = useSession();
    const isGuest = (session?.user as any)?.role === "guest";
    const { handleOpenGuestPopup } = useGuestModePopup();

    const handleAction = (action: () => void) => {
        if (isGuest) {
            handleOpenGuestPopup();
        } else {
            action();
        }
    };

    const handleUnpublishClick = () => {
        if (isGuest) {
            handleOpenGuestPopup();
            return;
        }
        if (unpublishDailySchedule) {
            handleOpenPopup(
                "deleteDailyCol",
                "האם לבטל את הפרסום?",
                unpublishDailySchedule,
                "כן",
                "לא",
                <Icons.faq size={40} />,
                "yes", // defaultAnswer
            );
        }
    };

    const GuestOverlay = () => (
        <div
            onClick={(e) => {
                e.stopPropagation();
                handleOpenGuestPopup();
            }}
            style={{
                position: "absolute",
                inset: 0,
                cursor: "not-allowed",
                zIndex: 10,
            }}
            title="אפשרות זו אינה זמינה לאורח"
        />
    );

    const guestWrapperStyle: React.CSSProperties = {
        position: "relative",
        opacity: 0.5,
    };

    return (
        <div className={styles.topNavBtnContainer}>
            <span title={isEmpty ? "אין נתונים לתצוגה מקדימה" : "תצוגה מקדימה"}>
                <IconBtn
                    Icon={<Icons.eye size={24} />}
                    onClick={togglePreviewMode}
                    hasBorder
                    disabled={isEmpty}
                />
            </span>

            {isDisabled ? (
                <div style={isGuest ? guestWrapperStyle : undefined}>
                    <div
                        className={`${styles.publishedStatus} ${styles.clickableStatus}`}
                        onClick={handleUnpublishClick}
                        title="לחצו לביטול הפרסום"
                        role="button"
                        tabIndex={0}
                        style={{ cursor: isGuest ? "not-allowed" : "pointer" }}
                    >
                        <Icons.success size={20} />
                        <span>פורסם</span>
                    </div>
                </div>
            ) : (
                <button
                    className={styles.publishBtn}
                    onClick={publishDailySchedule}
                    disabled={publishLoading || isEmpty}
                    title={isEmpty ? "אין נתונים לפרסום" : "פרסום המערכת היומית"}
                >
                    {publishLoading ? (
                        <Loading size="S" />
                    ) : (
                        <>
                            <Icons.publish size={20} />
                            <span>פרסום</span>
                        </>
                    )}
                </button>
            )}

            <div style={isGuest ? guestWrapperStyle : undefined}>
                <span title="שיתוף קישור למורים מן המניין">
                    <IconBtn
                        Icon={<Icons.share size={16} />}
                        onClick={() => handleAction(onShareLink)}
                        disabled={publishLoading}
                        hasBorder
                    />
                </span>
                {isGuest && <GuestOverlay />}
            </div>
        </div>
    );
};

export default DailyPublishActionBtns;
