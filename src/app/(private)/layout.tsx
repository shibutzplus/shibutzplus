import React from "react";
import TopNav from "@/components/navigation/TopNav/TopNav";
import Providers from "./providers";
import "./layout.css";

export default function ContentLayout({ children }: { children: React.ReactNode }) {
    return (
        <Providers>
            <div className="content-layout" dir="rtl">
                <TopNav />

                <main className="content-main">{children}</main>
            </div>
        </Providers>
    );
}
