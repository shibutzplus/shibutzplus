import { PortalWriteProvider } from "@/context/PortalWriteContext";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
    return <PortalWriteProvider>{children}</PortalWriteProvider>;
}
