import IconBtn from "@/components/ui/buttons/IconBtn/IconBtn";
import Icons from "@/style/icons";
import React from "react";
import styles from "./DailyPublishActionBtns.module.css";
import usePublish from "@/hooks/usePublish";
import { useDailyTableContext } from "@/context/DailyTableContext";

const DailyPublishActionBtns: React.FC = () => {
    const { isEditMode, changeDailyMode } = useDailyTableContext();

    const {
        publishDailySchedule,
        isLoading: publishLoading,
        onShareLink,
        isDisabled,
    } = usePublish();
    //TODO: why we have both span with title and IconBtn with title?
    return (
        <div className={styles.topNavBtnContainer}>
            <span title="תצוגה מקדימה">
                <IconBtn
                    title="תצוגה מקדימה כפי שמורים רואים את המערכת"
                    Icon={isEditMode ? <Icons.eye size={20} /> : <Icons.edit size={20} />}
                    onClick={changeDailyMode}
                    disabled={publishLoading}
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

            <span title="פרסום">
                <IconBtn
                    Icon={isDisabled ? <Icons.success2 size={20} /> : <Icons.publish size={20} />}
                    isLoading={publishLoading}
                    onClick={publishDailySchedule}
                    disabled={isDisabled}
                    hasBorder
                />
            </span>
        </div>
    );
};

export default DailyPublishActionBtns;
