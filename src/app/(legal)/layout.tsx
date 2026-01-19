import React from "react";
import LegalPageLayout from "@/components/layout/pageLayouts/LegalPageLayout/LegalPageLayout";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
    return (
        <LegalPageLayout>
            {children}
        </LegalPageLayout>
    );
}
