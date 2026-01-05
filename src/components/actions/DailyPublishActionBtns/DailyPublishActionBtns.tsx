import IconBtn from "@/components/ui/buttons/IconBtn/IconBtn";
import Icons from "@/style/icons";
import React from "react";
import styles from "./DailyPublishActionBtns.module.css";
import usePublish from "@/hooks/usePublish";
import Loading from "@/components/loading/Loading/Loading";
import { useDailyTableContext } from "@/context/DailyTableContext";

import useDeletePopup from "@/hooks/useDeletePopup";

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

    const handleUnpublishClick = () => {
        if (unpublishDailySchedule) {
            handleOpenPopup(
                "deleteDailyCol",
                "האם לבטל את הפרסום?",
                unpublishDailySchedule,
                "כן",
                "לא",
                <Icons.faq size={40} />,
                "yes" // defaultAnswer
            );
        }
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
                <div
                    className={`${styles.publishedStatus} ${styles.clickableStatus}`}
                    onClick={handleUnpublishClick}
                    title="לחצו לביטול הפרסום"
                    role="button"
                    tabIndex={0}
                >
                    <Icons.success size={20} />
                    <span>פורסם</span>
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

            <span title="שיתוף קישור למורים מן המניין">
                <IconBtn
                    Icon={<Icons.share size={16} />}
                    onClick={onShareLink}
                    disabled={publishLoading}
                    hasBorder
                />
            </span>



        </div >
    );
};

export default DailyPublishActionBtns;
