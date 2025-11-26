import type { Metadata } from "next";
import { AnnualTableProvider } from "@/context/AnnualTableContext";
import AnnualClassPageLayout from "@/components/layout/pageLayouts/AnnualClassPageLayout/AnnualClassPageLayout";
import AnnualSkeleton from "@/components/loading/skeleton/AnnualSkeleton/AnnualSkeleton";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "מערכת שבועית לפי כיתה | שיבוץ+",
    robots: "noindex, nofollow",
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={<AnnualSkeleton />}>
            <AnnualTableProvider>
                <AnnualClassPageLayout>{children}</AnnualClassPageLayout>
            </AnnualTableProvider>
        </Suspense>
    );
}
