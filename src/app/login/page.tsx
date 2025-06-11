"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import AuthInputText from "@/components/ui/AuthInputText/AuthInputText";
import AuthInputPassword from "@/components/ui/AuthInputPassword/AuthInputPassword";
import AuthBtn from "@/components/ui/AuthBtn/AuthBtn";
import styles from "./login.module.css";
import Link from "next/link";
import routePath from "../../routes";
import errMsg from "@/resources/errorsMsg";

const LoginPage: React.FC = () => {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(false);
    const [error, setError] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        const res = await signIn("credentials", {
            redirect: false,
            email,
            password,
            remember,
        });

        if (res?.error) {
            setError(errMsg.auth.login.failed);
        } else {
            router.push(routePath.dashboard.p);
        }

        setIsLoading(false);
    };

    return (
        <div className={styles.container}>
            <div className={styles.formContainer}>
                <h1 className={styles.title}>כניסה</h1>
                <form className={styles.form} onSubmit={handleSubmit}>
                    <AuthInputText
                        label="כתובת אימייל"
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <AuthInputPassword
                        label="סיסמה"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <AuthBtn
                        type="submit"
                        isLoading={isLoading}
                        loadingText="כניסה..."
                        buttonText="כניסה"
                        error={error}
                    />
                </form>
                <label>
                    <input
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                    />{" "}
                    תזכור אותי
                </label>

                <div className={styles.registerLink}>
                    <p>
                        אין לך חשבון? <Link href={routePath.register.p}>הירשם כאן</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
