"use client";

import React, { Suspense } from "react";
import PageLayout from "@/components/layout/PageLayout/PageLayout";
import TopNav from "@/components/navigation/TopNav/TopNav";
import HistoryTopActions from "@/components/actions/HistoryTopActions/HistoryTopActions";
import { HistoryTableProvider } from "@/context/HistoryTableContext";

// Loading fallback for the layout
const HistoryLayoutLoading = () => (
    <PageLayout>
        <div></div>
    </PageLayout>
);

export default function HistoryLayout({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={<HistoryLayoutLoading />}>
            <HistoryTableProvider>
                <PageLayout
                    CustomTopNav={<TopNav type="admin" actions={<HistoryTopActions />} />}
                >
                    {children}
                </PageLayout>
            </HistoryTableProvider>
        </Suspense>
    );
}
