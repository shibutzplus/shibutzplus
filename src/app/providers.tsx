"use client";
import React from "react";
import { SessionProvider } from "next-auth/react";
import { MainContextProvider } from "@/context/MainContext";
import { Toaster } from "react-hot-toast";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <MainContextProvider>
                {children}
                <Toaster />
            </MainContextProvider>
        </SessionProvider>
    );
}
