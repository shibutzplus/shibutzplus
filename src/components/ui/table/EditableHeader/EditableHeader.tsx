import React from "react"
import styles from "./EditableHeader.module.css"
import useDeletePopup from "@/hooks/useDeletePopup"
import { errorToast } from "@/lib/toast"
import messages from "@/resources/messages"
import { useDailyTableContext } from "@/context/DailyTableContext"
import Icons from "@/style/icons"

type EditableHeaderProps = {
    children: React.ReactNode
    columnId: string
    deleteLabel?: string
}

const EditableHeader: React.FC<EditableHeaderProps> = ({ children, columnId, deleteLabel }) => {
    const { deleteColumn } = useDailyTableContext()
    const { handleOpenPopup } = useDeletePopup()

    const deleteCol = async () => {
        const response = await deleteColumn(columnId)
        if (!response) {
            errorToast(messages.dailySchedule.deleteError)
        }
    }

    const handleDeleteColumn = (e: React.MouseEvent) => {
        e.stopPropagation()
        const msg = deleteLabel ? `האם למחוק את ${deleteLabel}?` : `האם למחוק את העמודה?`
        handleOpenPopup(
            "deleteDailyCol",
            msg,
            deleteCol
        )
    }

    return (
        <div className={styles.columnHeader}>
            <Icons.delete className={styles.clearButton} onClick={handleDeleteColumn} />
            {children}
        </div>
    )
}

export default EditableHeader
