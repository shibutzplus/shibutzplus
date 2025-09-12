"use client";

import React from "react";
import { usePortal } from "@/context/PortalContext";
import TopNav from "@/components/navigation/TopNav/TopNav";
import PortalTopActions from "@/components/actions/PortalTopActions/PortalTopActions";
import PublicPageLayout from "@/components/layout/PublicPageLayout/PublicPageLayout";
import PublicMobileNav from "@/components/navigation/PublicMobileNav/PublicMobileNav";
import { useMobileSize } from "@/hooks/useMobileSize";

function TeacherTopNav() {
    const { teacher } = usePortal();
    return (
        <TopNav type="portal" greetingName={teacher?.name ?? ""} actions={<PortalTopActions />} />
    );
}

export default function Layout({ children }: { children: React.ReactNode }) {
    const isMobile = useMobileSize();
    return (
        <PublicPageLayout CustomTopNav={<TeacherTopNav />}>
            <main>
                <section style={{marginBottom: "64px"}}>{children}</section>
                {isMobile ? <PublicMobileNav /> : null}
            </main>
        </PublicPageLayout>
    );
}
