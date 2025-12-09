// Server component layout: defines metadata and wraps children with the client layout
import React from "react";
import PrivatePageLayout from "@/components/layout/PrivatePageLayout/PrivatePageLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
    return <PrivatePageLayout>{children}</PrivatePageLayout>;
}
