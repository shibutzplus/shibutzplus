import React from "react";
import { MainContextProvider } from "@/context/MainContext";
import AuthGuard from "@/components/auth/AuthGuard";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <MainContextProvider>
            <AuthGuard>{children}</AuthGuard>
        </MainContextProvider>
    );
}
