import type { Metadata } from "next";
import { PortalProvider } from "@/context/PortalContext";
import PortalPageLayout from "@/components/layout/pageLayouts/PortalPageLayout/PortalPageLayout";

export const metadata: Metadata = {
    title: "המערכת שלי | שיבוץ+",
    robots: "noindex, nofollow",
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <PortalProvider>
            <PortalPageLayout>{children}</PortalPageLayout>
        </PortalProvider>
    );
}
