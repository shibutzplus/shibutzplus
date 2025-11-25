import React, { useRef } from "react";
import styles from "./EditableHeader.module.css";
import useDeletePopup from "@/hooks/useDeletePopup";
import Icons from "@/style/icons";
import { useStickyHeader } from "@/hooks/scroll/useStickyHeader";

type EditableHeaderProps = {
    children: React.ReactNode;
    color: string;
    deleteLabel?: string;
    deleteCol: () => Promise<void>;
};

const EditableHeader: React.FC<EditableHeaderProps> = ({
    children,
    color,
    deleteLabel,
    deleteCol,
}) => {
    const { handleOpenPopup } = useDeletePopup();
    const headerRef = useRef<HTMLDivElement | null>(null);
    useStickyHeader(headerRef);

    const handleDeleteColumn = (e: React.MouseEvent) => {
        e.stopPropagation();
        const msg = deleteLabel ? `האם למחוק את ${deleteLabel}?` : `האם למחוק את העמודה?`;
        handleOpenPopup("deleteDailyCol", msg, deleteCol);
    };

    return (
        <div ref={headerRef} className={styles.columnHeaderWrapper}>
            <div className={styles.columnHeader} style={{ backgroundColor: color }}>
                <Icons.delete
                    className={styles.clearButton}
                    onClick={handleDeleteColumn}
                    size={20}
                />
                {children}
            </div>
        </div>
    );
};

export default EditableHeader;
