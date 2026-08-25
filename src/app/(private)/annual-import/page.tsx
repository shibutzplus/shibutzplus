"use client";

import dynamic from "next/dynamic";
import React from "react";
import Preloader from "@/components/ui/Preloader/Preloader";


const AnnualImportContent = dynamic(() => import("./AnnualImportContent"), {
    ssr: false,
    loading: () => (
        <div style={{ display: "flex", justifyContent: "center", marginTop: "20vh" }}>
            <Preloader />
        </div>
    ),
});

const AnnualImportPage = () => {
    return (
        <React.Suspense
            fallback={
                <div style={{ display: "flex", justifyContent: "center", marginTop: "20vh" }}>
                    <Preloader />
                </div>
            }
        >
            <AnnualImportContent />
        </React.Suspense>
    );
};

export default AnnualImportPage;
