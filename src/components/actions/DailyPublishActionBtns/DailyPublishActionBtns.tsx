import IconBtn from "@/components/ui/buttons/IconBtn/IconBtn";
import Icons from "@/style/icons";
import React from "react";
import styles from "./DailyPublishActionBtns.module.css";
import usePublish from "@/hooks/usePublish";
import Loading from "@/components/loading/Loading/Loading";
import { useDailyTableContext } from "@/context/DailyTableContext";

const DailyPublishActionBtns: React.FC = () => {
    const { isEditMode, isLoadingEditPage, changeDailyMode } = useDailyTableContext();

    const {
        publishDailySchedule,
        isLoading: publishLoading,
        onShareLink,
        isDisabled,
    } = usePublish();

    return (
        <div className={styles.topNavBtnContainer}>
            {isDisabled ? (
                <div className={styles.publishedStatus}>
                    <Icons.success2 size={20} />
                    <span>פורסם</span>
                </div>
            ) : (
                <button
                    className={styles.publishBtn}
                    onClick={publishDailySchedule}
                    disabled={publishLoading}
                    title="פרסום המערכת היומית"
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

            <span title={isEditMode ? "תצוגה מקדימה / בדיקה" : "חזרה לשיבוץ"}>
                <IconBtn
                    Icon={isEditMode ? <Icons.eye size={24} /> : <Icons.eyeOff size={20} />}
                    onClick={changeDailyMode}
                    disabled={isLoadingEditPage}
                    hasBorder
                />
            </span>

            <span title="שיתוף קישור למורים מן המניין">
                <IconBtn
                    Icon={<Icons.share size={16} />}
                    onClick={onShareLink}
                    disabled={publishLoading}
                    hasBorder
                />
            </span>
        </div>
    );
};

export default DailyPublishActionBtns;
