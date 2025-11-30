"use client";
import { useEffect, useRef, useState } from "react";

export const useDailyEditMode = () => {
    const [isEditMode, setIsEditMode] = useState(true);
    const [isLoadingEditPage, setIsLoadingEditPage] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const changeDailyMode = () => {
        setIsLoadingEditPage(true);
        setIsEditMode((prev) => !prev);

        timeoutRef.current = setTimeout(() => {
            setIsLoadingEditPage(false);
        }, 400);
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    return { isEditMode, isLoadingEditPage, changeDailyMode };
};
