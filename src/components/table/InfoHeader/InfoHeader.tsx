import React from "react";
import styles from "./InfoHeader.module.css";
import InputText from "../../ui/InputText/InputText";
import useDeletePopup from "@/hooks/useDeletePopup";
import { PopupAction } from "@/context/PopupContext";
import { errorToast, successToast } from "@/lib/toast";
import messages from "@/resources/messages";
import { useDailyTableContext } from "@/context/DailyTableContext";

type InfoHeaderProps = {
    columnId: string;
};

const InfoHeader: React.FC<InfoHeaderProps> = ({ columnId }) => {
    const { handleOpenPopup } = useDeletePopup();
    const { dailySchedule, populateTeacherColumn, deleteColumn } = useDailyTableContext();

    const handleChange = (value: string) => {
        console.log("InfoHeader input changed:", value);
    };

    const deleteCol = async () => {
        const response = await deleteColumn(columnId);
        if (response) {
            successToast(messages.dailySchedule.deleteSuccess);
        } else {
            errorToast(messages.dailySchedule.deleteError);
        }
    };

    const handleDeleteColumn = (e: React.MouseEvent) => {
        e.stopPropagation();
        handleOpenPopup(
            PopupAction.deleteDailyCol,
            `האם אתה בטוח שברצונך למחוק את השורה`,
            deleteCol,
        );
    };

    return (
        <div className={styles.columnHeader}>
            <button className={styles.clearButton} onClick={handleDeleteColumn}>
                הסר
            </button>
            <InputText
                placeholder="מידע"
                backgroundColor="transparent"
                onBlur={(e) => handleChange(e.target.value)}
            />
        </div>
    );
};

export default InfoHeader;
