import React, { Suspense } from "react";
import PageLayout from "@/components/layout/PageLayout/PageLayout";
import { HistoryTableProvider } from "@/context/HistoryTableContext";
import HistoryTopNav from "@/components/navigation/topNavs/HistoryTopNav/HistoryTopNav";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "מערכות יומיות | שיבוץ+",
  robots: "noindex, nofollow",
};

// Loading fallback for the layout
const HistoryLayoutLoading = () => (
    <PageLayout TopNav={<div />}>
        <div></div>
    </PageLayout>
);

export default function HistoryLayout({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={<HistoryLayoutLoading />}>
            <HistoryTableProvider>
                <PageLayout TopNav={<HistoryTopNav />}>{children}</PageLayout>
            </HistoryTableProvider>
        </Suspense>
    );
}
