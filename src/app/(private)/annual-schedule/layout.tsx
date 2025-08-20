import React from "react";
import TopNav from "@/components/navigation/TopNav/TopNav";
import PrivatePageLayout from "@/components/layout/PrivatePageLayout/PrivatePageLayout";
import { AnnualTableProvider } from "@/context/AnnualTableContext";
import AnnualTopActions from "@/components/actions/AnnualTopActions/AnnualTopActions";

export default function AnnualScheduleLayout({ children }: { children: React.ReactNode }) {
    return (
        <AnnualTableProvider>
            <PrivatePageLayout CustomTopNav={<TopNav Actions={<AnnualTopActions />} />}>
                {children}
            </PrivatePageLayout>
        </AnnualTableProvider>
    );
}
