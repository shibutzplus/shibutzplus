import React from "react";
import PortalAltPageLayout from "@/components/layout/pageLayouts/PortalAltPageLayout/PortalAltPageLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
    return <PortalAltPageLayout>{children}</PortalAltPageLayout>;
}
