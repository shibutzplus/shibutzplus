"use client";

import AuthHero from "@/components/layout/AuthHero/AuthHero";
import LoginForm from "@/components/auth/LoginForm/LoginForm";
import styles from "./signIn.module.css";
import { NextPage } from "next";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { STATUS_AUTH, STATUS_LOADING } from "@/models/constant/session";
import { DEFAULT_REDIRECT } from "@/routes/protectedAuth";
import router from "@/routes";

const SignInPage: NextPage = () => {
    const { data: session, status } = useSession();
    const route = useRouter();

    useEffect(() => {
        if (status === STATUS_AUTH) {
            if (!session.user.schoolId || session.user.status === "onboarding") {
                route.push(DEFAULT_REDIRECT);
            } else if (
                session.user.status === "onboarding-annual" ||
                session.user.status === "onboarding-daily"
            ) {
                route.push(router.annualSchedule.p);
            } else {
                route.push(router.dailySchedule.p);
            }
        }
    }, [status, router]);

    if (status === STATUS_LOADING) return null;

    return (
        <main className={styles.container}>
            <div className={styles.contentWrapper}>
                <AuthHero />
                <LoginForm />
            </div>
        </main>
    );
};

export default SignInPage;
