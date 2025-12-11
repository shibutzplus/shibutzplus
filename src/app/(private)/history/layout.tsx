import React, { Suspense } from "react";
import { HistoryTableProvider } from "@/context/HistoryTableContext";
import { Metadata } from "next";
import HistoryPageLayout from "@/components/layout/pageLayouts/HistoryPageLayout/HistoryPageLayout";
import Preloader from "@/components/ui/Preloader/Preloader";

export const metadata: Metadata = {
    title: "היסטוריה | שיבוץ+",
    robots: "noindex, nofollow",
};

export default function HistoryLayout({ children }: { children: React.ReactNode }) {
    return (
        <Suspense
            fallback={
                <div
                    style={{
                        position: "absolute",
                        top: "40%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                    }}
                >
                    <Preloader />
                </div>
            }
        >
            <HistoryTableProvider>
                <HistoryPageLayout>{children}</HistoryPageLayout>
            </HistoryTableProvider>
        </Suspense>
    );
}
