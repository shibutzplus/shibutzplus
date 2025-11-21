import React, { Suspense } from "react";
import { HistoryTableProvider } from "@/context/HistoryTableContext";
import HistoryTopNav from "@/components/navigation/topNavs/HistoryTopNav/HistoryTopNav";
import { Metadata } from "next";
import HistoryPageLayout from "@/components/layout/pageLayouts/HistoryPageLayout/HistoryPageLayout";

export const metadata: Metadata = {
  title: "היסטוריה | שיבוץ+",
  robots: "noindex, nofollow",
};

// Loading fallback for the layout
const HistoryLayoutLoading = () => (
    <HistoryPageLayout>
        <div/>
    </HistoryPageLayout>
);

export default function HistoryLayout({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={<HistoryLayoutLoading />}>
            <HistoryTableProvider>
                <HistoryPageLayout>{children}</HistoryPageLayout>
            </HistoryTableProvider>
        </Suspense>
    );
}
