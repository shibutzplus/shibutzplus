"use client";

import { useSession } from "next-auth/react";
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface LanguageContextType {}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const {data: session} = useSession();
    const gender = session?.user?.gender;

    const [userGender, setUserGender] = useState(gender);
    
    const value: LanguageContextType = {};

    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};
