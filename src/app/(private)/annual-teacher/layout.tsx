import type { Metadata } from "next";
import { AnnualByTeacherProvider } from "@/context/AnnualByTeacherContext";
import AnnualTeacherPageLayout from "@/components/layout/pageLayouts/AnnualTeacherPageLayout/AnnualTeacherPageLayout";
import Preloader from "@/components/ui/Preloader/Preloader";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "מערכת שנתית לפי מורה",
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
            <AnnualByTeacherProvider>
                <AnnualTeacherPageLayout>{children}</AnnualTeacherPageLayout>
            </AnnualByTeacherProvider>
        </Suspense>
    );
}
