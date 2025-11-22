import type { Metadata } from "next";
import { AnnualTableProvider } from "@/context/AnnualTableContext";
import AnnualPageLayout from "@/components/layout/pageLayouts/AnnualPageLayout/AnnualPageLayout";
import AnnualSkeleton from "@/components/loading/skeleton/AnnualSkeleton/AnnualSkeleton";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "מערכת שבועית | שיבוץ+",
    robots: "noindex, nofollow",
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={<AnnualSkeleton />}>
            <AnnualTableProvider>
                <AnnualPageLayout>{children}</AnnualPageLayout>
            </AnnualTableProvider>
        </Suspense>
    );
}
