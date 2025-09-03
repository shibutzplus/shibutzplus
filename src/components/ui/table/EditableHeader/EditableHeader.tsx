import React from "react";
import styles from "./EditableHeader.module.css";
import useDeletePopup from "@/hooks/useDeletePopup";
import { PopupAction } from "@/context/PopupContext";
import { errorToast, successToast } from "@/lib/toast";
import messages from "@/resources/messages";
import { useDailyTableContext } from "@/context/DailyTableContext";
import Icons from "@/style/icons";


type EditableHeaderProps = {
    children: React.ReactNode;
    columnId: string;
};

const EditableHeader: React.FC<EditableHeaderProps> = ({ children, columnId }) => {
    const { deleteColumn } = useDailyTableContext();
    const { handleOpenPopup } = useDeletePopup();

    const deleteCol = async () => {
        const response = await deleteColumn(columnId);
        if (!response) {
            errorToast(messages.dailySchedule.deleteError);
        //} else {
        //    successToast(messages.dailySchedule.deleteSuccess);
        }
    };

    const handleDeleteColumn = (e: React.MouseEvent) => {
        e.stopPropagation();
        handleOpenPopup(
            PopupAction.deleteDailyCol,
            `האם למחוק את העמודה?`,
            deleteCol,
        );
    };

    return (
        <div className={styles.columnHeader}>
            <Icons.delete className={styles.clearButton} onClick={handleDeleteColumn} />
            {children}
        </div>
    );
};

export default EditableHeader;
