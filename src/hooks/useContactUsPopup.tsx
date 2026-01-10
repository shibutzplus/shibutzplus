import { usePopup } from "@/context/PopupContext";
import ContactUsPopup from "@/components/popups/ContactUsPopup/ContactUsPopup";
import React from "react";

const useContactUsPopup = () => {
    const { openPopup } = usePopup();

    const handleOpenContactPopup = () => {
        openPopup(
            "contactUs",
            "S",
            <ContactUsPopup />
        );
    };

    return {
        handleOpenContactPopup,
    };
};

export default useContactUsPopup;
