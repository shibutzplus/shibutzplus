import React from "react";
import PortalPageLayout from "@/components/layout/pageLayouts/PortalPageLayout/PortalPageLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
    return <PortalPageLayout>{children}</PortalPageLayout>;
}
