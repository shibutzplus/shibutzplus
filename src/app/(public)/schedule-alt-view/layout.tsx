import React from "react";
import PortalAltPageLayout from "@/components/layout/pageLayouts/PortalAltPageLayout/PortalAltPageLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "מערכת בית ספרית לזמן חירום",
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <PortalAltPageLayout>{children}</PortalAltPageLayout>;
}
