"use client";

import router from "@/routes";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const OnboardingPage: React.FC = () => {
    const route = useRouter();
    useEffect(() => {
        route.push(router.onboardingUserInfo.p);
    }, [route]);

    return null;
};

export default OnboardingPage;
