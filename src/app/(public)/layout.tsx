import type { Metadata } from "next";
import PageLayout from "@/components/layout/PageLayout/PageLayout";
import PortalTopNav from "@/components/navigation/topNavs/PortalTopNav/PortalTopNav";
import { PortalProvider } from "@/context/PortalContext";

export const metadata: Metadata = {
    title: "המערכת שלי | שיבוץ+",
    robots: "noindex, nofollow",
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <PortalProvider>
            <PageLayout TopNav={<PortalTopNav />}>{children}</PageLayout>
        </PortalProvider>
    );
}
