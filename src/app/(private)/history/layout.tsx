import React from "react";
import { HistoryTableProvider } from "@/context/HistoryTableContext";
import { Metadata } from "next";
import HistoryPageLayout from "@/components/layout/pageLayouts/HistoryPageLayout/HistoryPageLayout";

export const metadata: Metadata = {
    title: "היסטוריה",
    robots: "noindex, nofollow",
};

export default function HistoryLayout({ children }: { children: React.ReactNode }) {
    return (
        <HistoryTableProvider>
            <HistoryPageLayout>{children}</HistoryPageLayout>
        </HistoryTableProvider>
    );
}
