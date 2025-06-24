"use client";
import React from "react";
import { SessionProvider } from "next-auth/react";
import { MainContextProvider } from "@/context/MainContext";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <MainContextProvider>{children}</MainContextProvider>
        </SessionProvider>
    );
}
