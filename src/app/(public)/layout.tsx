"use client";

import PrivatePageLayout from "@/components/layout/PrivatePageLayout/PrivatePageLayout";
import PublicTopNav from "@/components/navigation/PublicTopNav/PublicTopNav";
import { PublicPortalProvider } from "@/context/PublicPortalContext";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <PublicPortalProvider>
            <PrivatePageLayout CustomTopNav={<PublicTopNav />}>{children}</PrivatePageLayout>
        </PublicPortalProvider>
    );
}
