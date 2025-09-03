// app/(private)/annual/layout.tsx
// comments: English only
import React from "react";
import PrivatePageLayout from "@/components/layout/PrivatePageLayout/PrivatePageLayout";
import { AnnualTableProvider } from "@/context/AnnualTableContext";
import CommonTopNav from "@/components/navigation/CommonTopNav/CommonTopNav";
import AnnualTopActions from "@/components/actions/AnnualTopActions/AnnualTopActions";

export default function AnnualScheduleLayout({ children }: { children: React.ReactNode }) {
    return (
        <AnnualTableProvider>
            <PrivatePageLayout
                CustomTopNav={<CommonTopNav type="admin" actions={<AnnualTopActions />} />}
            >
                {children}
            </PrivatePageLayout>
        </AnnualTableProvider>
    );
}
