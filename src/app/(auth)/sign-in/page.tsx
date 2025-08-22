"use client";

import Image from "next/image";
import styles from "./signIn.module.css";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { STATUS_AUTH } from "@/models/constant/session";
import { DEFAULT_REDIRECT } from "@/routes/protectedAuth";
import router from "@/routes";
import GoogleIcon from "@/components/ui/assets/googleIcon";
import Link from "next/link";
import { signInWithGoogle } from "@/app/actions/POST/signInAction";
import { EmailLink } from "@/models/constant";
import Logo from "@/components/core/Logo/Logo";
import { errorToast } from "@/lib/toast";
import messages from "@/resources/messages";
import Loading from "@/components/core/Loading/Loading";

const SignInPage: NextPage = () => {
    const { data: session, status } = useSession();
    const searchParams = useSearchParams();
    const googleError = searchParams.get("error");
    const route = useRouter();
    const [error, setError] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (googleError === "AccessDenied") {
            errorToast(messages.auth.accessDenied);
        }
    }, [googleError]);

    useEffect(() => {
        if (status === STATUS_AUTH && session.user) {
            setIsLoading(false);
            if (session.user.status === "annual") {
                route.push(DEFAULT_REDIRECT);
            } else {
                route.push(router.dailySchedule.p);
            }
        }
    }, [status, router, session]);

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        const res = await signInWithGoogle();
        if (!res.success) {
            setError(res.message);
            setIsLoading(false);
            return;
        }
    };

    return (
        <main className={styles.container}>
            <section className={styles.mainSection}>
                <div className={styles.heroSection}>
                    <div className={styles.schoolIcon}>
                        <Logo />
                    </div>
                    <h2 className={styles.schoolTitle}>שיבוץ +</h2>

                    <div className={styles.schoolDescription}>
                        <h3>מערכת לניהול בית הספר</h3>
                        <p>בניית מערכת שעות, בצורה קלה ומהירה</p>
                    </div>
                </div>
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
                            בעיה בהתחברות?{" "}
                            <Link href={EmailLink} className={styles.problemLink}>
                                צרו קשר
                            </Link>
                        </p>
                    </div>
                </div>
            </section>

            <div className={styles.illustrationContainer}>
                <Image
                    src="/undraw_workspace_s6wf.svg"
                    alt="Workspace Illustration"
                    width={140}
                    height={40}
                    className={styles.illustration}
                    priority
                />
            </div>
        </main>
    );
};

export default SignInPage;
