"use client";

import { NextPage } from "next";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import Loading from "@/components/loading/Loading/Loading";
import SignInLoadingPage from "@/components/loading/SignInLoadingPage/SignInLoadingPage";
import routes from "@/routes";
import { STATUS_AUTH, STATUS_LOADING, STATUS_UNAUTH } from "@/models/constant/session";
import messages from "@/resources/messages";
import styles from "../../sign-in/signIn.module.css";

const AdminSignInPage: NextPage = () => {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const hasNavigatedRef = useRef(false);

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
            const userRole = (session.user as any).role;

            if (userRole === "admin") {
                hasNavigatedRef.current = true;
                router.push(routes.schoolSelect.p);
                return;
            }

            setError(messages.auth.login.adminOnly);
            setIsLoading(false);
        }
    }, [status, session, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError(messages.auth.login.invalidCredentials);
                setIsLoading(false);
            } else if (result?.ok) {
                setIsLoading(true);
            }
        } catch (_err) {
            setError(messages.common.serverError);
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
                <div className={styles.formContainer}>
                    <h1 style={{ marginBottom: "2rem", textAlign: "center" }}>כניסת מנהל</h1>
                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div>
                            <label htmlFor="email" style={{ display: "block", marginBottom: "0.5rem" }}>
                                אימייל
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                                style={{
                                    width: "100%",
                                    padding: "0.75rem",
                                    border: "1px solid #ccc",
                                    borderRadius: "4px",
                                    fontSize: "1rem"
                                }}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" style={{ display: "block", marginBottom: "0.5rem" }}>
                                סיסמה
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                                style={{
                                    width: "100%",
                                    padding: "0.75rem",
                                    border: "1px solid #ccc",
                                    borderRadius: "4px",
                                    fontSize: "1rem"
                                }}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={styles.googleButton}
                            style={{ marginTop: "1rem" }}
                        >
                            {isLoading ? <Loading /> : "התחבר"}
                        </button>
                        {error && <p className={styles.error}>{error}</p>}
                    </form>
                </div>
            </section>
        </main>
    );
};

export default AdminSignInPage;
