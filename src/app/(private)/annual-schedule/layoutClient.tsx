import React from "react";
import PrivatePageLayout from "@/components/layout/PrivatePageLayout/PrivatePageLayout";
import { AnnualTableProvider } from "@/context/AnnualTableContext";
import TopNav from "@/components/navigation/TopNav/TopNav";
import AnnualTopActions from "@/components/actions/AnnualTopActions/AnnualTopActions";

export default function AnnualScheduleLayout({ children }: { children: React.ReactNode }) {
    return (
        <AnnualTableProvider>
            <PrivatePageLayout
                CustomTopNav={<TopNav type="admin" actions={<AnnualTopActions />} />}
            >
                {children}
            </PrivatePageLayout>
        </AnnualTableProvider>
    );
}
