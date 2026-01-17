import { usePopup } from "@/context/PopupContext";
import GuestModePopup from "@/components/popups/GuestModePopup/GuestModePopup";
import React from "react";

const useGuestModePopup = () => {
    const { openPopup } = usePopup();

    const handleOpenGuestPopup = () => {
        openPopup(
            "guestMode",
            "S",
            <GuestModePopup />
        );
    };

    return {
        handleOpenGuestPopup,
    };
};

export default useGuestModePopup;
