import type { Metadata } from "next";
import { AnnualViewProvider } from "@/context/AnnualViewContext";
import AnnualViewPageLayout from "../../../components/layout/pageLayouts/AnnualViewPageLayout/AnnualViewPageLayout";
import Preloader from "@/components/ui/Preloader/Preloader";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "מערכת שנתית",
    robots: "noindex, nofollow",
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <Suspense
            fallback={
                <div style={{
                    position: 'absolute',
                    top: '40%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                }}>
                    <Preloader />
                </div>
            }
        >
            <AnnualViewProvider>
                <AnnualViewPageLayout>{children}</AnnualViewPageLayout>
            </AnnualViewProvider>
        </Suspense>
    );
}
