import React from "react";
import PortalFullScreenLayout from "@/components/layout/pageLayouts/FullScreenLayout/PortalFullScreenLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
    return <PortalFullScreenLayout>{children}</PortalFullScreenLayout>;
}
