"use client";
import { useState } from "react";

export const useDailyEditMode = () => {
    const [isEditMode, setIsEditMode] = useState(true);

    const changeDailyMode = () => {
        setIsEditMode((prev) => !prev);
    };

    return { isEditMode, isLoadingEditPage: false, changeDailyMode }; // Keeping isLoadingEditPage false for compatibility
};
