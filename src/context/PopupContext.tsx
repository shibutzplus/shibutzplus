"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import PopupModal from "@/components/popups/PopupModal/PopupModal";
import { PopupSize } from "@/models/types/ui";

export type PopupType = "deleteTeacher" | "deleteClass" | "deleteSubject" | "deleteDailyCol" | "settings" | "guestMode" | "contactUs" | "msgPopup";
export const PopupAction: Record<PopupType, PopupType> = {
    deleteTeacher: "deleteTeacher",
    deleteClass: "deleteClass",
    deleteSubject: "deleteSubject",
    deleteDailyCol: "deleteDailyCol",
    settings: "settings",
    guestMode: "guestMode",
    contactUs: "contactUs",
    msgPopup: "msgPopup"
};

interface PopupContextType {
    openPopup: (name: PopupType, size: PopupSize, content: React.ReactNode) => void;
    closePopup: () => void;
    isOpen: boolean;
    currentPopup: {
        name: PopupType | null;
        content: React.ReactNode;
        size: PopupSize;
    };
}

const PopupContext = createContext<PopupContextType | undefined>(undefined);

export const usePopup = () => {
    const context = useContext(PopupContext);
    if (context === undefined) {
        throw new Error("usePopup must be used within a PopupProvider");
    }
    return context;
};

export const PopupProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentPopup, setCurrentPopup] = useState<{
        name: PopupType | null;
        content: React.ReactNode;
        size: PopupSize;
    }>({
        name: null,
        content: null,
        size: "M",
    });

    const openPopup = (name: PopupType, size: PopupSize, content: React.ReactNode) => {
        setCurrentPopup({ name, content, size });
        setIsOpen(true);
    };

    const closePopup = () => {
        setIsOpen(false);
    };

    const value: PopupContextType = {
        openPopup,
        closePopup,
        isOpen,
        currentPopup,
    };

    return (
        <PopupContext.Provider value={value}>
            {children}
            <PopupModal isOpen={isOpen} onClose={closePopup} size={currentPopup.size}>
                {currentPopup.content}
            </PopupModal>
        </PopupContext.Provider>
    );
};
