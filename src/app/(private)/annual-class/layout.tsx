import type { Metadata } from "next";
import { AnnualByClassProvider } from "@/context/AnnualByClassContext";
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
            <AnnualByClassProvider>
                <AnnualClassPageLayout>{children}</AnnualClassPageLayout>
            </AnnualByClassProvider>
        </Suspense>
    );
}
