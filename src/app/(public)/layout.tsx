import type { Metadata } from "next";
import { PortalProvider } from "@/context/PortalContext";
import { Suspense } from "react";
import TeacherPortalSkeleton from "@/components/loading/skeleton/TeacherPortalSkeleton/TeacherPortalSkeleton";
import PortalPageLayout from "@/components/layout/pageLayouts/PortalPageLayout/PortalPageLayout";

export const metadata: Metadata = {
    title: "המערכת שלי | שיבוץ+",
    robots: "noindex, nofollow",
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={<TeacherPortalSkeleton />}>
            <PortalProvider>
                <PortalPageLayout>{children}</PortalPageLayout>
            </PortalProvider>
        </Suspense>
    );
}
