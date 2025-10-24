import React from "react";
import PageLayout from "@/components/layout/PageLayout/PageLayout";
import DetailsTopNav from "@/components/navigation/topNavs/DetailsTopNav/DetailsTopNav";

export default function Layout({ children }: { children: React.ReactNode }) {
    return <PageLayout TopNav={<DetailsTopNav />}>{children}</PageLayout>;
}