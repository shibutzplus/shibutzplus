"use client";

import React from "react";
import TopNav from "@/components/navigation/TopNav/TopNav";
import { useMobileSize } from "@/hooks/useMobileSize";

export default function FAQManagerLayoutClient({ children }: { children: React.ReactNode }) {
    const isMobile = useMobileSize();

    return (
        <>
            <TopNav type="admin" usePageTitle={true} />

            <div className="flex flex-col min-h-screen bg-white">
                <main className="flex-1 overflow-y-auto">
                    <div
                        className="container mx-auto p-4 pb-24"
                        style={{
                            marginTop: isMobile ? "45px" : "70px",
                            marginBottom: isMobile ? "0px" : "30px",
                        }}
                    >
                        {children}
                    </div>
                </main>
            </div>
        </>
    );
}
