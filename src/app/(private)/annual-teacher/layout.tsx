import type { Metadata } from "next";
import { AnnualByTeacherProvider } from "@/context/AnnualByTeacherContext";
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
            <AnnualByTeacherProvider>
                <AnnualTeacherPageLayout>{children}</AnnualTeacherPageLayout>
            </AnnualByTeacherProvider>
        </Suspense>
    );
}
