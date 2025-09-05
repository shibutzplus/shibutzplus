import React from "react";
import { MainContextProvider } from "@/context/MainContext";

export default function Layout({ children }: { children: React.ReactNode }) {
    return <MainContextProvider>{children}</MainContextProvider>;
}
