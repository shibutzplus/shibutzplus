import { PopupType, usePopup } from "@/context/PopupContext";
import DeletePopup from "@/components/popups/DeletePopup/DeletePopup";
import React from "react";

const useDeletePopup = () => {
    const { openPopup, closePopup } = usePopup();

    const handleOpenPopup = (
        type: PopupType,
        text: string,
        onDeleteAction: () => Promise<void>,
        confirmBtnText?: string,
        cancelBtnText?: string,
        Icon?: React.ElementType | React.ReactNode,
        defaultAnswer?: "yes" | "no",
    ) => {
        openPopup(
            type,
            "S",
            <DeletePopup
                text={text}
                onDelete={onDeleteAction}
                onCancel={closePopup}
                confirmText={confirmBtnText}
                cancelText={cancelBtnText}
                Icon={Icon}
                defaultAnswer={defaultAnswer}
            />,
        );
    };

    return {
        handleOpenPopup,
    };
};

export default useDeletePopup;
