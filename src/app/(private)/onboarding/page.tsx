"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const OnboardingPage: React.FC = () => {
    const router = useRouter();

    useEffect(() => {
        router.push("/onboarding/user-info");
    }, [router]);

    return null;
};

export default OnboardingPage;
