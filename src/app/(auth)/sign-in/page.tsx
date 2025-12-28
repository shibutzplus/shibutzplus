"use client";

import styles from "./signIn.module.css";
import { NextPage } from "next";
import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import GoogleIcon from "@/components/ui/assets/googleIcon";
import Loading from "@/components/loading/Loading/Loading";
import SignInLoadingPage from "@/components/loading/SignInLoadingPage/SignInLoadingPage";
import { signInWithGoogle } from "@/app/actions/POST/signInAction";
import { STATUS_LOADING, STATUS_UNAUTH } from "@/models/constant/session";
import { errorToast } from "@/lib/toast";
import messages from "@/resources/messages";
import HeroSection from "@/components/auth/HeroSection/HeroSection";

const SignInContent: React.FC = () => {
    const { data: session, status } = useSession();
    const searchParams = useSearchParams();
    const googleError = searchParams.get("error");
    const router = useRouter();
    const [error, setError] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (googleError === "AccessDenied") {
            errorToast(messages.auth.accessDenied);
            router.replace(window.location.pathname);
        }
    }, [googleError, router]);

    useEffect(() => {
        if (status === STATUS_LOADING) setIsLoading(true);
    }, [status]);

    useEffect(() => {
        if (status === STATUS_UNAUTH) {
            setIsLoading(false);
        }
    }, [status]);

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        const res = await signInWithGoogle();
        if (!res.success) {
            setError(res.message);
            setIsLoading(false);
        }
    };

    if (isLoading || status === STATUS_LOADING) {
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
