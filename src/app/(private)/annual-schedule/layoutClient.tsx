import React from "react";
import { AnnualTableProvider } from "@/context/AnnualTableContext";
import TopNav from "@/components/navigation/TopNav/TopNav";
import AnnualTopActions from "@/components/actions/AnnualTopActions/AnnualTopActions";
import PageLayout from "@/components/layout/PageLayout/PageLayout";

export default function AnnualScheduleLayout({ children }: { children: React.ReactNode }) {
    return (
        <AnnualTableProvider>
            <PageLayout
                TopNav={<TopNav type="admin" actions={<AnnualTopActions />} />}
            >
                {children}
            </PageLayout>
        </AnnualTableProvider>
    );
}
