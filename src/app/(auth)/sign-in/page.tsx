"use client";

import styles from "./signIn.module.css";
import { NextPage } from "next";
import Link from "next/link";
import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import GoogleIcon from "@/components/ui/assets/googleIcon";
import Loading from "@/components/core/Loading/Loading";
import HeroSection from "@/components/layout/HeroSection/HeroSection";
import SignInLoadingPage from "@/components/layout/loading/SignInLoadingPage/SignInLoadingPage";
import { signInWithGoogle } from "@/app/actions/POST/signInAction";
import { DEFAULT_REDIRECT } from "@/routes/protectedAuth";
import routes from "@/routes";
import { EmailLink } from "@/models/constant";
import { STATUS_AUTH, STATUS_LOADING, STATUS_UNAUTH } from "@/models/constant/session";
import { infoToast } from "@/lib/toast";
import messages from "@/resources/messages";

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
            infoToast(messages.auth.accessDenied);
        }
    }, [googleError]);

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
            hasNavigatedRef.current = true;
            setIsLoading(true);
            const target =
                (session.user as any).status === "annual"
                    ? DEFAULT_REDIRECT
                    : routes.dailySchedule.p;
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
                        <GoogleIcon /> התחברות בעזרת Google
                    </button>
                    {error && <p className={styles.error}>{error}</p>}
                    <div className={styles.registerLink}>
                        <p>
                            <Link href={EmailLink} className={styles.problemLink}>
                                צרו קשר
                            </Link>
                        </p>
                    </div>
                </div>
            </section>

            {/* <div className={styles.illustrationContainer}>
                <Image
                    src="/LoginImage.png"
                    alt="שיבוץ+"
                    width={0}
                    height={0}
                    sizes="40vw"
                    className={styles.illustration}
                    priority
                />
            </div> */}
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
