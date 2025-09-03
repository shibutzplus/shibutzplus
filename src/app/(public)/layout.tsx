"use client";

import React from "react";
import PrivatePageLayout from "@/components/layout/PrivatePageLayout/PrivatePageLayout";
import { PublicPortalProvider, usePublicPortal } from "@/context/PublicPortalContext";
import CommonTopNav from "@/components/navigation/CommonTopNav/CommonTopNav";
import PortalTopActions from "@/components/actions/PortalTopActions/PortalTopActions";

function TeacherTopNav() {
    const { teacher } = usePublicPortal();
    return (
        <CommonTopNav
            kind="teacher"
            greetingName={teacher?.name ?? ""}
            actions={<PortalTopActions />}
        />
    );
}

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <PublicPortalProvider>
            <PrivatePageLayout CustomTopNav={<TeacherTopNav />}>
                {children}
            </PrivatePageLayout>
        </PublicPortalProvider>
    );
}
