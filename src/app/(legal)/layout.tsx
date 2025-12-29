import type { Metadata } from "next";
import PageLayout from "@/components/layout/PageLayout/PageLayout";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
    return (
        <PageLayout appType="public">
            {children}
        </PageLayout>
    );
}
