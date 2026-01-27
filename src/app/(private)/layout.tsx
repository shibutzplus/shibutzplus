import React from "react";
import { MainContextProvider } from "@/context/MainContext";
import AuthGuard from "@/components/auth/AuthGuard";

import Preloader from "@/components/ui/Preloader/Preloader";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <React.Suspense fallback={<div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}><Preloader /></div>}>
            <MainContextProvider>
                <AuthGuard>{children}</AuthGuard>
            </MainContextProvider>
        </React.Suspense>
    );
}
