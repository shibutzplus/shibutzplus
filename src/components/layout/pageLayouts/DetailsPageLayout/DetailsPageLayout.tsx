import React from "react";
import PageLayout from "../../PageLayout/PageLayout";

type DetailsPageLayoutProps = {
    children: React.ReactNode;
    pageTitle: string;
};

export default function DetailsPageLayout({ children, pageTitle }: DetailsPageLayoutProps) {
    return (
        <PageLayout appType="private" leftSideWidth={50} HeaderRightActions={<h3>{pageTitle}</h3>}>
            {children}
        </PageLayout>
    );
}
