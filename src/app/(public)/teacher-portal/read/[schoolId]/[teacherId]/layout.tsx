import { PortalReadProvider } from "@/context/PortalReadContext";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
    return <PortalReadProvider>{children}</PortalReadProvider>;
}
