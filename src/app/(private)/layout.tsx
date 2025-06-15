"use client";

import React from "react";
import TopNav from "@/components/navigation/TopNav/TopNav";

export default function ContentLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="content-layout" dir="rtl">
            <TopNav />

            <main className="content-main">{children}</main>

            <style jsx>{`
                .content-layout {
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    background-color: var(--background);
                }

                .content-main {
                    flex: 1;
                    padding: 2rem;
                    max-width: 1200px;
                    margin: 0 auto;
                    width: 100%;
                }
            `}</style>
        </div>
    );
}
