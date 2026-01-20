import React from "react";
import LegalPageLayout from "@/components/layout/pageLayouts/LegalPageLayout/LegalPageLayout";

import Logo from "@/components/ui/Logo/Logo";
import { Metadata } from "next";

export const metadata: Metadata = {
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
};

export default function LegalLayout({ children }: { children: React.ReactNode }) {
    return (
        <LegalPageLayout>
            {children}
        </LegalPageLayout>
    );
}
