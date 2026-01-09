import React from "react";
import router from "@/routes";
import DetailsPageLayout from "@/components/layout/pageLayouts/DetailsPageLayout/DetailsPageLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <DetailsPageLayout pageTitle={router.historyUpdateManual.title}>
            {children}
        </DetailsPageLayout>
    );
}
