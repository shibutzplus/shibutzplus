import type { Metadata } from "next";
import { DailyTableProvider } from "@/context/DailyTableContext";
import DailyPageLayout from "@/components/layout/pageLayouts/DailyPageLayout/DailyPageLayout";
import Preloader from "@/components/ui/Preloader/Preloader";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "שיבוץ יומי | שיבוץ+",
    robots: "noindex, nofollow",
};

export default function Layout({ children }: { children: React.ReactNode }) {
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
            <DailyTableProvider>
                <DailyPageLayout>{children}</DailyPageLayout>
            </DailyTableProvider>
        </Suspense>
    );
}
