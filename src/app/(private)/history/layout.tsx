"use client";

import React, { Suspense } from "react";
import PrivatePageLayout from "@/components/layout/PrivatePageLayout/PrivatePageLayout";
import { HistoryTableProvider } from "@/context/HistoryTableContext";
import TopNav from "@/components/navigation/TopNav/TopNav";
import HistoryTopActions from "@/components/actions/HistoryTopActions/HistoryTopActions";

// Loading fallback for the layout
const HistoryLayoutLoading = ({ children }: { children: React.ReactNode }) => (
    <PrivatePageLayout>{children}</PrivatePageLayout>
);

export default function HistoryLayout({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={<HistoryLayoutLoading>{children}</HistoryLayoutLoading>}>
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
