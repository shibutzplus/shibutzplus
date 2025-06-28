"use client";

import React from "react";
import { PopupProvider } from "@/context/PopupContext";
import { ActionsProvider } from "@/context/ActionsContext";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <PopupProvider>
            <ActionsProvider>{children}</ActionsProvider>
        </PopupProvider>
    );
}
