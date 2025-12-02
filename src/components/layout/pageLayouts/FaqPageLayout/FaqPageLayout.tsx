import React from "react";
import router from "@/routes";
import { AppType } from "@/models/types";
import PageLayout from "../../PageLayout/PageLayout";

type FaqPageLayoutProps = {
    children: React.ReactNode;
    type: AppType;
};

export default function FaqPageLayout({ children, type }: FaqPageLayoutProps) {

    return (
        <PageLayout
            appType={type}
            HeaderRightActions={
                <h3>{type === "private" ? router.faqManager.title : router.faqTeachers.title}</h3>
            }
        >
            {children}
        </PageLayout>
    );
}
