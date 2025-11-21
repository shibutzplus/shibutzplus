import React from "react";
import styles from "./EditableHeader.module.css";
import useDeletePopup from "@/hooks/useDeletePopup";
import Icons from "@/style/icons";

type EditableHeaderProps = {
    children: React.ReactNode;
    color: string;
    deleteLabel?: string;
    deleteCol: () => Promise<void>
};

const EditableHeader: React.FC<EditableHeaderProps> = ({ children, color, deleteLabel, deleteCol }) => {
    const { handleOpenPopup } = useDeletePopup();

    const handleDeleteColumn = (e: React.MouseEvent) => {
        e.stopPropagation();
        const msg = deleteLabel ? `האם למחוק את ${deleteLabel}?` : `האם למחוק את העמודה?`;
        handleOpenPopup("deleteDailyCol", msg, deleteCol);
    };

    return (
        <div className={styles.columnHeader} style={{backgroundColor: color}}>
            <Icons.delete className={styles.clearButton} onClick={handleDeleteColumn} size={20} />
            {children}
        </div>
    );
};

export default EditableHeader;
