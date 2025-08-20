"use client";

import { onboardingNewUserAction } from "@/app/actions/POST/onboardingNewUserAction";
import { UserGender, UserRole } from "@/db/schema";
import { FullUser, SchoolLevel } from "@/models/types/onboarding";
import React, { createContext, useContext, useState, ReactNode } from "react";

interface OnboardingContextType {
    fullUser: FullUser;
    fillUserInfo: (name: string, gender: UserGender, role: UserRole) => void;
    fillSchoolInfo: (
        schoolName: string,
        level: SchoolLevel,
    ) => Promise<{
        success: boolean;
        status: "onboarding-daily" | "onboarding-annual" | undefined;
    }>;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const useOnboarding = () => {
    const context = useContext(OnboardingContext);
    if (context === undefined) {
        throw new Error("useOnboarding must be used within an OnboardingProvider");
    }
    return context;
};

export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [fullUser, setFullUser] = useState<FullUser>({
        name: "",
        gender: "male",
        role: "teacher",
        schoolName: "",
        level: "middle",
    });

    const fillUserInfo = (name: string, gender: UserGender, role: UserRole) => {
        setFullUser((prev) => ({ ...prev, name, gender, role }));
    };

    const fillSchoolInfo = async (schoolName: string, level: SchoolLevel) => {
        const user: FullUser = {
            name: fullUser.name,
            gender: fullUser.gender,
            role: fullUser.role,
            schoolName,
            level,
        };
        const { success, status } = await onboardingNewUserAction(user);
        return { success, status };
    };

    const value: OnboardingContextType = {
        fullUser,
        fillUserInfo,
        fillSchoolInfo,
    };

    return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
};
