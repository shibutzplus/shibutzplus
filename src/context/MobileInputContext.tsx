"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface MobileInputContextType {
    isOverlayOpen: boolean;
    isRichTextOverlayOpen: boolean;
    inputValue: string;
    placeholder: string;
    onSave: (value: string) => void;
    openOverlay: (initialValue: string, placeholder: string, onSave: (value: string) => void) => void;
    openRichTextOverlay: (initialValue: string, placeholder: string, onSave: (value: string) => void) => void;
    closeOverlay: () => void;
    closeRichTextOverlay: () => void;
    updateValue: (value: string) => void;
}

const MobileInputContext = createContext<MobileInputContextType | undefined>(undefined);

export const useMobileInput = () => {
    const context = useContext(MobileInputContext);
    if (context === undefined) {
        throw new Error("useMobileInput must be used within a MobileInputProvider");
    }
    return context;
};

export const MobileInputProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isOverlayOpen, setIsOverlayOpen] = useState(false);
    const [isRichTextOverlayOpen, setIsRichTextOverlayOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [placeholder, setPlaceholder] = useState("");
    const [onSave, setOnSave] = useState<(value: string) => void>(() => () => {});

    const openOverlay = (initialValue: string, placeholderText: string, saveCallback: (value: string) => void) => {
        setInputValue(initialValue);
        setPlaceholder(placeholderText);
        setOnSave(() => saveCallback);
        setIsOverlayOpen(true);
    };

    const openRichTextOverlay = (initialValue: string, placeholderText: string, saveCallback: (value: string) => void) => {
        setInputValue(initialValue);
        setPlaceholder(placeholderText);
        setOnSave(() => saveCallback);
        setIsRichTextOverlayOpen(true);
    };

    const closeOverlay = () => {
        setIsOverlayOpen(false);
        setInputValue("");
        setPlaceholder("");
        setOnSave(() => () => {});
    };

    const closeRichTextOverlay = () => {
        setIsRichTextOverlayOpen(false);
        setInputValue("");
        setPlaceholder("");
        setOnSave(() => () => {});
    };

    const updateValue = (value: string) => {
        setInputValue(value);
    };

    const value: MobileInputContextType = {
        isOverlayOpen,
        isRichTextOverlayOpen,
        inputValue,
        placeholder,
        onSave,
        openOverlay,
        openRichTextOverlay,
        closeOverlay,
        closeRichTextOverlay,
        updateValue,
    };

    return <MobileInputContext.Provider value={value}>{children}</MobileInputContext.Provider>;
};
