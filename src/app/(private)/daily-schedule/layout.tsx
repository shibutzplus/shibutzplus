import type { Metadata } from "next";
import { DailyTableProvider } from "@/context/DailyTableContext";
import DailyPageLayout from "@/components/layout/pageLayouts/DailyPageLayout/DailyPageLayout";
import DailySkeleton from "@/components/loading/skeleton/DailySkeleton/DailySkeleton";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "שיבוץ יומי | שיבוץ+",
    robots: "noindex, nofollow",
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={<DailySkeleton />}>
            <DailyTableProvider>
                <DailyPageLayout>{children}</DailyPageLayout>
            </DailyTableProvider>
        </Suspense>
    );
}
