import type { Metadata } from "next";
import { AnnualTableProvider } from "@/context/AnnualTableContext";
import AnnualTeacherPageLayout from "@/components/layout/pageLayouts/AnnualTeacherPageLayout/AnnualTeacherPageLayout";
import AnnualSkeleton from "@/components/loading/skeleton/AnnualSkeleton/AnnualSkeleton";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "מערכת שבועית לפי מורה | שיבוץ+",
    robots: "noindex, nofollow",
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={<AnnualSkeleton />}>
            <AnnualTableProvider>
                <AnnualTeacherPageLayout>{children}</AnnualTeacherPageLayout>
            </AnnualTableProvider>
        </Suspense>
    );
}
