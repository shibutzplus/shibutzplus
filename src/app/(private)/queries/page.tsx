"use client";

import dynamic from "next/dynamic";
import React from "react";
import Preloader from "@/components/ui/Preloader/Preloader";

const QueriesContent = dynamic(() => import("./QueriesContent"), {
    ssr: false,
    loading: () => (
        <div style={{ display: "flex", justifyContent: "center", marginTop: "20vh" }}>
            <Preloader />
        </div>
    ),
});

const QueriesPage = () => {
    return (
        <React.Suspense
            fallback={
                <div style={{ display: "flex", justifyContent: "center", marginTop: "20vh" }}>
                    <Preloader />
                </div>
            }
        >
            <QueriesContent />
        </React.Suspense>
    );
};

export default QueriesPage;
