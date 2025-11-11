"use client";

import styles from "./signIn.module.css";
import { NextPage } from "next";
import Link from "next/link";
import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import GoogleIcon from "@/components/ui/assets/googleIcon";
import Loading from "@/components/loading/Loading/Loading";
import HeroSection from "@/components/auth/HeroSection/HeroSection";
import SignInLoadingPage from "@/components/loading/SignInLoadingPage/SignInLoadingPage";
import { signInWithGoogle } from "@/app/actions/POST/signInAction";
import { DEFAULT_REDIRECT } from "@/routes/protectedAuth";
import routes from "@/routes";
import { EmailLink } from "@/models/constant";
import { STATUS_AUTH, STATUS_LOADING, STATUS_UNAUTH } from "@/models/constant/session";
import { infoToast } from "@/lib/toast";
import messages from "@/resources/messages";
import { getSchoolsMinAction } from "@/app/actions/GET/getSchoolsMinAction";

const POWER_USER_EMAIL = process.env.NEXT_PUBLIC_POWER_USER_EMAIL;

const SignInContent: React.FC = () => {
    const { data: session, status } = useSession();
    const searchParams = useSearchParams();
    const googleError = searchParams.get("error");
    const router = useRouter();
    const [error, setError] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const hasNavigatedRef = useRef(false);
    const [showSchoolPicker, setShowSchoolPicker] = useState(false);
    const [schools, setSchools] = useState<Array<{ id: string; name: string }>>([]);
    const [isLoadingSchools, setIsLoadingSchools] = useState(false);

    useEffect(() => {
        if (googleError === "AccessDenied") {
            infoToast(messages.auth.accessDenied);
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
            const email = (session.user as any)?.email as string | undefined;

            // Power User: Choose school
            if (email === POWER_USER_EMAIL) {
                setIsLoading(false);
                setShowSchoolPicker(true);
                if (schools.length === 0) {
                    setIsLoadingSchools(true);
                    (async () => {
                        try {
                            const list = await getSchoolsMinAction();
                            setSchools(Array.isArray(list) ? list : []);
                        } finally {
                            setIsLoadingSchools(false);
                        }
                    })();
                }
                return;
            }

            hasNavigatedRef.current = true;
            setIsLoading(true);
            const target =
                (session.user as any).status === "annual"
                    ? DEFAULT_REDIRECT
                    : routes.dailySchedule.p;
            router.push(target);
        }
    }, [status, session, router, schools.length]);

    // Select school for Power User
    const handlePickSchool = (schoolId: string) => {
        const target = (session?.user as any)?.status === "annual" ? DEFAULT_REDIRECT : routes.dailySchedule.p;
        hasNavigatedRef.current = true;
        setShowSchoolPicker(false);
        setIsLoading(true);
        router.push(`${target}?schoolId=${encodeURIComponent(schoolId)}`);
    };

    const handleClosePicker = () => {
        hasNavigatedRef.current = true;
        setShowSchoolPicker(false);
        setIsLoading(false);
    };

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        const res = await signInWithGoogle();
        if (!res.success) {
            setError(res.message);
            setIsLoading(false);
        }
    };

    if (
        (isLoading && !showSchoolPicker) ||
        status === STATUS_LOADING ||
        (status === STATUS_AUTH && !hasNavigatedRef.current && !showSchoolPicker)
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
                        <GoogleIcon /> משתמש רשום - התחברות
                    </button>
                    {error && <p className={styles.error}>{error}</p>}
                    <div className={styles.contact}>
                        <Link href={EmailLink} className={styles.contactLink}>
                            צרו קשר
                        </Link>
                    </div>
                </div>
            </section>

            {/* Small Div for power user school selection */}
            {showSchoolPicker && (
                <div className={styles.popupOverlay}>
                    <div className={styles.popupBox}>
                        {isLoadingSchools ? (
                            <p className={styles.zeroMargin}>טוען רשימה</p>
                        ) : schools.length === 0 ? (
                            <p className={styles.zeroMargin}>לא נמצאו בתי ספר</p>
                        ) : (
                            <ul className={styles.schoolList}>
                                {schools.map((s) => (
                                    <li key={s.id} className={styles.schoolListItem}>
                                        <button
                                            type="button"
                                            onClick={() => handlePickSchool(s.id)}
                                            className={styles.schoolButton}
                                        >
                                            {s.name}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <div className={styles.closeRow}>
                            <button
                                type="button"
                                onClick={handleClosePicker}
                                className={styles.closeButton}
                            >
                                סגירה
                            </button>
                        </div>
                    </div>
                </div>
            )}
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
