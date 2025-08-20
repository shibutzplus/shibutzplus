"use client";

import { STATUS_AUTH } from "@/models/constant/session";
import router from "@/routes";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

const OnboardingPage: React.FC = () => {
    const route = useRouter();
    const { data: session, status } = useSession({
        required: true,
    });

    const blockRef = useRef<boolean>(true);
    useEffect(() => {
        if (blockRef.current && session?.user && status === STATUS_AUTH) {
            blockRef.current = false;
            if (!session.user.schoolId || session.user.status === "onboarding") {
                route.push(router.onboardingUserInfo.p);
            } else if (
                session.user.status === "onboarding-annual" ||
                session.user.status === "onboarding-daily"
            ) {
                route.push(router.annualSchedule.p);
            } else {
                route.push(router.dailySchedule.p);
            }
        }
    }, [route, session, status]);

    return null;
};

export default OnboardingPage;
