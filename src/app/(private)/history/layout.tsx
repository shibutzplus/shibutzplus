import React from "react";
import TopNav from "@/components/navigation/TopNav/TopNav";
import PrivatePageLayout from "@/components/layout/PrivatePageLayout/PrivatePageLayout";
import { HistoryTableProvider } from "@/context/HistoryTableContext";
import HistoryTopActions from "@/components/actions/HistoryTopActions/HistoryTopActions";

export default function HistoryLayout({ children }: { children: React.ReactNode }) {
    return (
        <HistoryTableProvider>
            <PrivatePageLayout CustomTopNav={<TopNav Actions={<HistoryTopActions />} />}>
                {children}
            </PrivatePageLayout>
        </HistoryTableProvider>
    );
}
