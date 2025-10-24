"use client";

import styles from "./admin.module.css";
import { NextPage } from "next";
import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import GoogleIcon from "@/components/ui/assets/googleIcon";
import Loading from "@/components/core/Loading/Loading";
import HeroSection from "@/components/layout/HeroSection/HeroSection";
import SignInLoadingPage from "@/components/layout/loading/SignInLoadingPage/SignInLoadingPage";
import InputPassword from "@/components/ui/inputs/InputPassword/InputPassword";
import SubmitBtn from "@/components/ui/buttons/SubmitBtn/SubmitBtn";
import { signInAdminAction, getSchoolsForAdmin } from "@/app/actions/POST/signInAdminAction";
import { signInWithGoogle } from "@/app/actions/POST/signInAction";
import { DEFAULT_REDIRECT } from "@/routes/protectedAuth";
import routes from "@/routes";
import { STATUS_AUTH, STATUS_LOADING, STATUS_UNAUTH } from "@/models/constant/session";
import { infoToast } from "@/lib/toast";
import messages from "@/resources/messages";


const AdminSignInContent: React.FC = () => {
    const { data: session, status } = useSession();
    const searchParams = useSearchParams();
    const googleError = searchParams.get("error");
    const router = useRouter();
    const [error, setError] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [systemPassword, setSystemPassword] = useState("");
    const [showGoogleAuth, setShowGoogleAuth] = useState(false);
    const [showSchoolPicker, setShowSchoolPicker] = useState(false);
    const [schools, setSchools] = useState<Array<{ id: string; name: string }>>([]);
    const [isLoadingSchools, setIsLoadingSchools] = useState(false);
    const hasNavigatedRef = useRef(false);

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

    useEffect(() => {
        if (status === STATUS_AUTH && session?.user && !hasNavigatedRef.current) {
            const email = (session.user as any)?.email as string | undefined;

            if (email) {
                // Validate admin and get schools in one call
                (async () => {
                    try {
                        setIsLoadingSchools(true);
                        const result = await getSchoolsForAdmin(email);
                        
                        if (result.success && result.schools) {
                            setSchools(result.schools);
                            setShowSchoolPicker(true);
                            setIsLoading(false);
                        } else {
                            // Not admin email - show error
                            setError(result.message || "אין לך הרשאות מנהל מערכת");
                            setIsLoading(false);
                        }
                    } catch (error) {
                        setError("שגיאה בבדיקת הרשאות");
                        setIsLoading(false);
                    } finally {
                        setIsLoadingSchools(false);
                    }
                })();
            }
        }
    }, [status, session, router]);

    const handleSystemPasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        const res = await signInAdminAction({ systemPassword });

        if (!res.success) {
            setError(res.message);
            setIsLoading(false);
            return;
        }

        if (res.requiresGoogleAuth) {
            setShowGoogleAuth(true);
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        const res = await signInWithGoogle();
        if (!res.success) {
            setError(res.message);
            setIsLoading(false);
        }
    };

    // Select school for Admin User
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
                <HeroSection title="כניסת מנהל מערכת" description="ניהול מערכת השעות היומית" />
                <div className={styles.formContainer}>
                    {!showGoogleAuth ? (
                        <form onSubmit={handleSystemPasswordSubmit}>
                            <InputPassword
                                label="סיסמת מערכת"
                                id="systemPassword"
                                name="systemPassword"
                                value={systemPassword}
                                onChange={(e) => setSystemPassword(e.target.value)}
                                required
                            />
                            <br />
                            <SubmitBtn 
                                type="submit" 
                                isLoading={isLoading} 
                                buttonText="המשך" 
                                error={error} 
                            />
                        </form>
                    ) : (
                        <>
                            <button
                                type="button"
                                className={styles.googleButton}
                                onClick={handleGoogleSignIn}
                                disabled={isLoading}
                            >
                                {isLoading ? <Loading /> : null}
                                <GoogleIcon /> התחברות מנהל מערכת
                            </button>
                            {error && <p className={styles.error}>{error}</p>}
                        </>
                    )}
                </div>
            </section>

            {showSchoolPicker && (
                <div className={styles.popupOverlay}>
                    <div className={styles.popupBox}>
                        <h3 style={{ margin: "0 0 16px 0", textAlign: "center" }}>בחר בית ספר</h3>
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

const AdminSignInPage: NextPage = () => {
    return (
        <Suspense fallback={<Loading />}>
            <AdminSignInContent />
        </Suspense>
    );
};

export default AdminSignInPage;