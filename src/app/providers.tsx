"use client";
import React from "react";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { PopupProvider } from "@/context/PopupContext";
import { MobileInputProvider } from "@/context/MobileInputContext";
import MobileInputOverlay from "@/components/ui/MobileInputOverlay/MobileInputOverlay";
import MobileRichTextOverlay from "@/components/ui/MobileRichTextOverlay/MobileRichTextOverlay";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <PopupProvider>
                <MobileInputProvider>
                    {children}
                    <Toaster />
                    <MobileInputOverlay />
                    <MobileRichTextOverlay />
                </MobileInputProvider>
            </PopupProvider>
        </SessionProvider>
    );
}
