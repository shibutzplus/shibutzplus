"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { DailyScheduleCell, ColumnType } from "@/models/types/dailySchedule";

type ClipboardData = {
    type: ColumnType;
    columnData: {
        [hour: string]: DailyScheduleCell;
    };
    copiedAt: number;
} | null;

type ColumnClipboardContextType = {
    clipboardData: ClipboardData;
    copyColumn: (type: ColumnType, columnData: { [hour: string]: DailyScheduleCell }) => void;
    pasteColumn: () => { type: ColumnType; columnData: { [hour: string]: DailyScheduleCell } } | null;
    hasClipboardData: (type?: ColumnType) => boolean;
    clearClipboard: () => void;
};

const ColumnClipboardContext = createContext<ColumnClipboardContextType | undefined>(undefined);

export const ColumnClipboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [clipboardData, setClipboardData] = useState<ClipboardData>(null);

    const copyColumn = useCallback((type: ColumnType, columnData: { [hour: string]: DailyScheduleCell }) => {
        setClipboardData({
            type,
            columnData,
            copiedAt: Date.now(),
        });
    }, []);

    const pasteColumn = useCallback(() => {
        if (!clipboardData) return null;
        return {
            type: clipboardData.type,
            columnData: clipboardData.columnData,
        };
    }, [clipboardData]);

    const hasClipboardData = useCallback((type?: ColumnType) => {
        if (!clipboardData) return false;
        if (type) return clipboardData.type === type;
        return true;
    }, [clipboardData]);

    const clearClipboard = useCallback(() => {
        setClipboardData(null);
    }, []);

    return (
        <ColumnClipboardContext.Provider
            value={{
                clipboardData,
                copyColumn,
                pasteColumn,
                hasClipboardData,
                clearClipboard,
            }}
        >
            {children}
        </ColumnClipboardContext.Provider>
    );
};

export const useColumnClipboard = () => {
    const context = useContext(ColumnClipboardContext);
    if (context === undefined) {
        // Return a dummy context to prevent crashes in public views where clipboard is not needed
        return {
            clipboardData: null,
            copyColumn: () => { },
            pasteColumn: () => null,
            hasClipboardData: () => false,
            clearClipboard: () => { },
        };
    }
    return context;
};
