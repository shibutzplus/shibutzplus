"use client";

import { onboardingNewUserAction } from "@/app/actions/POST/onboardingNewUserAction";
import { UserGender, UserRole } from "@/db/schema";
import { FullUser } from "@/models/types/onboarding";
import { SchoolLevel } from "@/models/types/school";
import { useSession } from "next-auth/react";
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
    const {data: session } = useSession();
    const [fullUser, setFullUser] = useState<FullUser>({
        email: session?.user.email || "",
        name: "",
        gender: "male",
        role: "teacher",
        schoolName: "",
        level: "Middle",
    });

    const fillUserInfo = (name: string, gender: UserGender, role: UserRole) => {
        setFullUser((prev) => ({ ...prev, name, gender, role }));
    };

    const fillSchoolInfo = async (schoolName: string, level: SchoolLevel) => {
        if(session?.user.email){
            const user: FullUser = {
                email: session?.user.email,
                name: fullUser.name,
                gender: fullUser.gender,
                role: fullUser.role,
                schoolName,
                level,
            };
            const { success, status } = await onboardingNewUserAction(user);
            return { success, status };
        }
        return { success: false, status: undefined };
    };

    const value: OnboardingContextType = {
        fullUser,
        fillUserInfo,
        fillSchoolInfo,
    };

    return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
};
