"use client";

import React, { Suspense } from "react";
import PrivatePageLayout from "@/components/layout/PrivatePageLayout/PrivatePageLayout";
import TopNav from "@/components/navigation/TopNav/TopNav";
import HistoryTopActions from "@/components/actions/HistoryTopActions/HistoryTopActions";
import { HistoryTableProvider } from "@/context/HistoryTableContext";

// Loading fallback for the layout
const HistoryLayoutLoading = () => (
    <PrivatePageLayout>
        <div></div>
    </PrivatePageLayout>
);

export default function HistoryLayout({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={<HistoryLayoutLoading />}>
            <HistoryTableProvider>
                <PrivatePageLayout
                    CustomTopNav={<TopNav type="admin" actions={<HistoryTopActions />} />}
                >
                    {children}
                </PrivatePageLayout>
            </HistoryTableProvider>
        </Suspense>
    );
}
