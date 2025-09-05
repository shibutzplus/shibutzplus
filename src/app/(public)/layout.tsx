"use client";

import React from "react";
import { usePublicPortal } from "@/context/PublicPortalContext";
import CommonTopNav from "@/components/navigation/CommonTopNav/CommonTopNav";
import PortalTopActions from "@/components/actions/PortalTopActions/PortalTopActions";
import PublicPageLayout from "@/components/layout/PublicPageLayout/PublicPageLayout";

function TeacherTopNav() {
    const { teacher } = usePublicPortal();
    return (
        <CommonTopNav
            type="portal"
            greetingName={teacher?.name ?? ""}
            actions={<PortalTopActions />}
        />
    );
}

export default function Layout({ children }: { children: React.ReactNode }) {
    return <PublicPageLayout CustomTopNav={<TeacherTopNav />}>{children}</PublicPageLayout>;
}
