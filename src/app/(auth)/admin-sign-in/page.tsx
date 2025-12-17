"use client";

import styles from "./adminSignIn.module.css";
import { NextPage } from "next";
import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import Loading from "@/components/loading/Loading/Loading";
import HeroSection from "@/components/auth/HeroSection/HeroSection";
import SignInLoadingPage from "@/components/loading/SignInLoadingPage/SignInLoadingPage";
import { DEFAULT_REDIRECT } from "@/routes/protectedAuth";
import routes from "@/routes";
import { STATUS_AUTH, STATUS_LOADING, STATUS_UNAUTH } from "@/models/constant/session";
import { errorToast } from "@/lib/toast";
import messages from "@/resources/messages";
import { getSchoolsMinAction } from "@/app/actions/GET/getSchoolsMinAction";
import { sortByHebrewName } from "@/utils/sort";

const POWER_USER_EMAIL = process.env.NEXT_PUBLIC_POWER_USER_EMAIL || "test@gmail.com";

const SignInContent: React.FC = () => {
    const { data: session, status } = useSession();
    const searchParams = useSearchParams();
    const googleError = searchParams.get("error");
    const router = useRouter();
    const [error, setError] = useState<string>("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const hasNavigatedRef = useRef(false);
    const [showSchoolPicker, setShowSchoolPicker] = useState(false);
    const [schools, setSchools] = useState<Array<{ id: string; name: string }>>([]);
    const [isLoadingSchools, setIsLoadingSchools] = useState(false);

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
        if (status === STATUS_UNAUTH && !hasNavigatedRef.current) {
            setIsLoading(false);
        }
    }, [status]);

    // Navigate once authenticated; keep loader visible until push completes
    useEffect(() => {
        if (status === STATUS_AUTH && session?.user && !hasNavigatedRef.current) {
            const email = (session.user as any)?.email as string | undefined;

            // Power User: Choose school
            const normalizedEmail = email?.toLowerCase().trim();
            const normalizedPowerUserEmail = POWER_USER_EMAIL?.toLowerCase().trim();

            if (
                normalizedEmail === process.env.NEXT_PUBLIC_POWER_USER_EMAIL ||
                (normalizedPowerUserEmail && normalizedEmail === normalizedPowerUserEmail)
            ) {
                setIsLoading(false);
                setShowSchoolPicker(true);
                if (schools.length === 0) {
                    setIsLoadingSchools(true);
                    (async () => {
                        try {
                            const list = await getSchoolsMinAction();
                            const schoolsList = Array.isArray(list) ? list : [];
                            const sorted = sortByHebrewName(schoolsList);
                            setSchools(sorted);
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
        const target =
            (session?.user as any)?.status === "annual" ? DEFAULT_REDIRECT : routes.dailySchedule.p;
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
                <HeroSection title="כניסת מנהל" description="התחברות באמצעות אימייל וסיסמה" />
                <div className={styles.formContainer}>
                    <form
                        className={styles.credentialsForm}
                        onSubmit={async (e) => {
                            e.preventDefault();
                            setIsLoading(true);
                            setError("");
                            const res = await signIn("credentials", {
                                email,
                                password,
                                redirect: false,
                            });
                            if (res?.error) {
                                setError(messages.auth.login.failed);
                                setIsLoading(false);
                            } else if (res?.ok) {
                                // Success - the session effect will handle the rest
                            }
                        }}
                    >
                        <div className={styles.inputGroup}>
                            <label htmlFor="email">אימייל</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className={styles.input}
                                disabled={isLoading}
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label htmlFor="password">סיסמה</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className={styles.input}
                                disabled={isLoading}
                            />
                        </div>
                        <button type="submit" className={styles.submitButton} disabled={isLoading}>
                            {isLoading ? <Loading /> : "התחברות"}
                        </button>
                    </form>
                    {error && <p className={styles.error}>{error}</p>}
                </div>
            </section>
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
