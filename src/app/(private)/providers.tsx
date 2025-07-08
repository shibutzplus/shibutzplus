"use client";

import React from "react";
import { PopupProvider } from "@/context/PopupContext";
import { TopNavProvider } from "@/context/TopNavContext";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <PopupProvider>
            <TopNavProvider>{children}</TopNavProvider>
        </PopupProvider>
    );
}
