import type { Metadata } from "next";
import { AnnualByClassProvider } from "@/context/AnnualByClassContext";
import AnnualClassPageLayout from "@/components/layout/pageLayouts/AnnualClassPageLayout/AnnualClassPageLayout";
import Preloader from "@/components/ui/Preloader/Preloader";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "מערכת שנתית לפי כיתה | שיבוץ+",
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
            <AnnualByClassProvider>
                <AnnualClassPageLayout>{children}</AnnualClassPageLayout>
            </AnnualByClassProvider>
        </Suspense>
    );
}
