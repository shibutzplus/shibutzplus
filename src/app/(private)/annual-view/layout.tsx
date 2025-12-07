import type { Metadata } from "next";
import { AnnualViewProvider } from "@/context/AnnualViewContext";
import AnnualViewPageLayout from "../../../components/layout/pageLayouts/AnnualViewPageLayout/AnnualViewPageLayout";
import AnnualSkeleton from "../../../components/loading/skeleton/AnnualSkeleton/AnnualSkeleton";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "מערכת שנתית - צפייה | שיבוץ+",
    robots: "noindex, nofollow",
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={<AnnualSkeleton />}>
            <AnnualViewProvider>
                <AnnualViewPageLayout>{children}</AnnualViewPageLayout>
            </AnnualViewProvider>
        </Suspense>
    );
}
