"use client";

import React from "react";
import { PopupProvider } from "@/context/PopupContext";
import { TopNavProvider } from "@/context/TopNavContext";
import { DailyTableProvider } from "@/context/DailyTableContext";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <PopupProvider>
            <TopNavProvider>
                <DailyTableProvider>{children}</DailyTableProvider>
            </TopNavProvider>
        </PopupProvider>
    );
}
