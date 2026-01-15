import { PopupType, usePopup } from "@/context/PopupContext";
import ConfirmPopup from "@/components/popups/ConfirmPopup/ConfirmPopup";
import React from "react";

const useConfirmPopup = () => {
    const { openPopup, closePopup } = usePopup();

    const handleOpenPopup = (
        type: PopupType,
        text: string,
        onDeleteAction: () => Promise<void>,
        yesText?: string,
        noText?: string,
        defaultAnswer?: "yes" | "no",
    ) => {
        openPopup(
            type,
            "S",
            <ConfirmPopup
                text={text}
                onYes={onDeleteAction}
                onNo={closePopup}
                yesText={yesText}
                noText={noText}
                defaultAnswer={defaultAnswer}
            />,
        );
    };

    return {
        handleOpenPopup,
    };
};

export default useConfirmPopup;
