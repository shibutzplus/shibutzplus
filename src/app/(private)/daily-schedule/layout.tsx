import React from "react";
import PrivatePageLayout from "@/components/layout/PrivatePageLayout/PrivatePageLayout";
import { DailyTableProvider } from "@/context/DailyTableContext";
import TopNav from "@/components/navigation/TopNav/TopNav";
import DailyTopActions from "@/components/actions/DailyTopActions/DailyTopActions";

export default function DailyScheduleLayout({ children }: { children: React.ReactNode }) {
    return (
        <DailyTableProvider>
            <PrivatePageLayout
                CustomTopNav={<TopNav type="admin" actions={<DailyTopActions />} />}
            >
                {children}
            </PrivatePageLayout>
        </DailyTableProvider>
    );
}
