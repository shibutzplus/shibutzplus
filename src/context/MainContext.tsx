"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface MainContextType {
    data: string;
}

const MainContext = createContext<MainContextType | undefined>(undefined);

export const useMainContext = () => {
    const context = useContext(MainContext);
    if (context === undefined) {
        throw new Error("useMainContext must be used within a MainContextProvider");
    }
    return context;
};

interface MainContextProviderProps {
    children: ReactNode;
}

export const MainContextProvider: React.FC<MainContextProviderProps> = ({ children }) => {
    const [data, setData] = useState<string>("");

    const value: MainContextType = {
        data,
    };

    return <MainContext.Provider value={value}>{children}</MainContext.Provider>;
};
