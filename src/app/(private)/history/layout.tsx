import React, { Suspense } from "react";
import { HistoryTableProvider } from "@/context/HistoryTableContext";
import { Metadata } from "next";
import HistoryPageLayout from "@/components/layout/pageLayouts/HistoryPageLayout/HistoryPageLayout";
import DailySkeleton from "@/components/loading/skeleton/DailySkeleton/DailySkeleton";

export const metadata: Metadata = {
    title: "היסטוריה | שיבוץ+",
    robots: "noindex, nofollow",
};

export default function HistoryLayout({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={<DailySkeleton />}>
            <HistoryTableProvider>
                <HistoryPageLayout>{children}</HistoryPageLayout>
            </HistoryTableProvider>
        </Suspense>
    );
}
