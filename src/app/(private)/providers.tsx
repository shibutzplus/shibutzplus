"use client";

import React from "react";
import { PopupProvider } from "@/context/PopupContext";

export default function Providers({ children }: { children: React.ReactNode }) {
    return <PopupProvider>{children}</PopupProvider>;
}
