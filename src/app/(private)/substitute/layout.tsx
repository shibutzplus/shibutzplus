import React from "react";
import PrivatePageLayout from "@/components/layout/PrivatePageLayout/PrivatePageLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
    return <PrivatePageLayout>{children}</PrivatePageLayout>;
}
