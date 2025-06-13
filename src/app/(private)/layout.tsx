"use client";

import React from "react";
import SideNav from "@/components/navigation/SideNav/SideNav";
import TopNav from "@/components/navigation/TopNav/TopNav";

export default function ContentLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="content-layout" dir="rtl">
            <TopNav />

            <SideNav />

            <main className="content-main">{children}</main>

            <footer className="content-footer">
                <p>© {new Date().getFullYear()} שיבוץ + | כל הזכויות שמורות</p>
            </footer>

            <style jsx>{`
                .content-layout {
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    padding-left: 240px; /* Same as SideNav width */
                }

                .content-main {
                    flex: 1;
                    padding: 2rem;
                    max-width: 1200px;
                    margin: 0 auto;
                    width: 100%;
                }

                .content-footer {
                    background-color: #f5f5f5;
                    padding: 1.5rem;
                    text-align: center;
                    color: var(--description-text);
                }
            `}</style>
        </div>
    );
}
