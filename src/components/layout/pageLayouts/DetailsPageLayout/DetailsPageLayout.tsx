"use client";

import React, { useState } from "react";
import styles from "./DetailsPageLayout.module.css";
import Logo from "@/components/ui/Logo/Logo";
import HamburgerNav, { HamburgerButton } from "@/components/navigation/HamburgerNav/HamburgerNav";
import PageLayout from "../../PageLayout/PageLayout";

type DetailsPageLayoutProps = {
    children: React.ReactNode;
    pageTitle: string;
};

export default function DetailsPageLayout({ children, pageTitle }: DetailsPageLayoutProps) {
    return (
        <PageLayout appType="private" HeaderRightActions={<h3>{pageTitle}</h3>}>
            {children}
        </PageLayout>
    );
}
