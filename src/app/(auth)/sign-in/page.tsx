"use client";

import styles from "./signIn.module.css";
import { NextPage } from "next";
import Link from "next/link";
import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import GoogleIcon from "@/components/ui/assets/googleIcon";
import Loading from "@/components/loading/Loading/Loading";
import SignInLoadingPage from "@/components/loading/SignInLoadingPage/SignInLoadingPage";
import { signInWithGoogle } from "@/app/actions/POST/signInAction";
import { DEFAULT_REDIRECT } from "@/routes/protectedAuth";
import routes from "@/routes";
import { STATUS_AUTH, STATUS_LOADING, STATUS_UNAUTH } from "@/models/constant/session";
import { successToast } from "@/lib/toast";
import messages from "@/resources/messages";
import HeroSection from "@/components/auth/HeroSection/HeroSection";

const SignInContent: React.FC = () => {
    const { data: session, status } = useSession();
    const searchParams = useSearchParams();
    const googleError = searchParams.get("error");
    const router = useRouter();
    const [error, setError] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const hasNavigatedRef = useRef(false);

    useEffect(() => {
        if (googleError === "AccessDenied") {
            successToast(messages.auth.accessDenied, Infinity);
            router.replace(window.location.pathname);
        }
    }, [googleError, router]);

    useEffect(() => {
        if (status === STATUS_LOADING) setIsLoading(true);
    }, [status]);

    useEffect(() => {
        if (status === STATUS_UNAUTH && !hasNavigatedRef.current) {
            setIsLoading(false);
        }
    }, [status]);

    // Navigate once authenticated; keep loader visible until push completes
    useEffect(() => {
        if (status === STATUS_AUTH && session?.user && !hasNavigatedRef.current) {
            const userRole = (session.user as any).role;
            const userStatus = (session.user as any).status;

            // Admin: Redirect to School Select
            if (userRole === "admin") {
                hasNavigatedRef.current = true;
                router.push(routes.schoolSelect.p);
                return;
            }

            hasNavigatedRef.current = true;
            setIsLoading(true);
            const target = userStatus === "annual" ? DEFAULT_REDIRECT : routes.dailySchedule.p;
            router.push(target);
        }
    }, [status, session, router]);

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        const res = await signInWithGoogle();
        if (!res.success) {
            setError(res.message);
            setIsLoading(false);
        }
    };

    if (
        isLoading ||
        status === STATUS_LOADING ||
        (status === STATUS_AUTH && !hasNavigatedRef.current)
    ) {
        return <SignInLoadingPage />;
    }

    return (
        <main className={styles.container}>
            <section className={styles.mainSection}>
                <HeroSection title="ניהול מערכת השעות היומית" description="פשוט, חכם, יעיל" />
                <div className={styles.formContainer}>
                    <button
                        type="button"
                        className={styles.googleButton}
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                    >
                        {isLoading ? <Loading /> : null}
                        <GoogleIcon /> התחברות
                    </button>
                    {error && <p className={styles.error}>{error}</p>}
                    <footer className={styles.registerLink}>
                        <Link
                            href={`mailto:${process.env.NEXT_PUBLIC_POWER_USER_EMAIL || ""}`}
                            className={styles.problemLink}
                        >
                            <span>צרו קשר</span>
                            <span className={styles.emailLine}>
                                {process.env.NEXT_PUBLIC_POWER_USER_EMAIL}
                            </span>
                        </Link>
                    </footer>
                </div>
            </section>
        </main>
    );
};

const SignInPage: NextPage = () => {
    return (
        <Suspense fallback={<Loading />}>
            <SignInContent />
        </Suspense>
    );
};

export default SignInPage;
