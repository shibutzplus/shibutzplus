"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import InputText from "@/components/ui/InputText/InputText";
import InputPassword from "@/components/ui/InputPassword/InputPassword";
import SubmitBtn from "@/components/ui/SubmitBtn/SubmitBtn";
import styles from "./LoginForm.module.css";
import Link from "next/link";
import routePath from "../../../routes";
import { EmailLink, emailPlaceholder } from "@/models/constant";
import { SignInRequest } from "@/models/types/auth";
import { signInWithCredentials, signInWithGoogle } from "@/app/actions/POST/signInAction";
import { loginSchema } from "@/models/validation/login";
import GoogleIcon from "@/components/ui/assets/googleIcon";
import { DEFAULT_REDIRECT } from "@/routes/protectedAuth";

const LoginForm: React.FC = () => {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(false);
    const [error, setError] = useState<string>("");
    const [validationErrors, setValidationErrors] = useState<{
        email?: string;
        password?: string;
    }>({});
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setValidationErrors({});
        setIsLoading(true);

        const validationResult = loginSchema.safeParse({
            email,
            password,
            remember,
        });

        if (!validationResult.success) {
            const fieldErrors: { email?: string; password?: string } = {};
            validationResult.error.issues.forEach((issue) => {
                const field = issue.path[0] as keyof typeof fieldErrors;
                if (field === "email" || field === "password") {
                    fieldErrors[field] = issue.message;
                }
            });
            setValidationErrors(fieldErrors);
            setIsLoading(false);
            return;
        }

        const res = await signInWithCredentials({ email, password, remember } as SignInRequest);

        if (!res.success) {
            setError(res.message);
            setIsLoading(false);
            return;
        }
    };

    const handleGoogleSignIn = async () => {
        const res = await signInWithGoogle();
        if (!res.success) {
            setError(res.message);
            setIsLoading(false);
            return;
        }
        router.push(DEFAULT_REDIRECT);
    };

    return (
        <div className={styles.formContainer}>
            <h1 className={styles.title}>כניסה</h1>
            <p className={styles.subtitle}>התחברו למערכת בעזרת שם המשתמש והסיסמה שלכם</p>

            <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.inputGroup}>
                    <InputText
                        id="email"
                        type="email"
                        value={email}
                        label="כתובת אימייל"
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={emailPlaceholder}
                        error={validationErrors.email}
                        required
                    />
                </div>

                <div className={styles.inputGroup}>
                    <InputPassword
                        id="password"
                        value={password}
                        label="סיסמה"
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="הזינו את הסיסמה"
                        error={validationErrors.password}
                        required
                    />
                </div>

                <div className={styles.rememberContainer}>
                    <label className={styles.rememberLabel}>
                        <input
                            type="checkbox"
                            className={styles.rememberCheckbox}
                            checked={remember}
                            onChange={(e) => setRemember(e.target.checked)}
                        />
                        <span>זכור אותי לפעם הבאה</span>
                    </label>
                    <div className={styles.forgotPassword}>
                        <Link href={routePath.forget.p}>שכחת סיסמה?</Link>
                    </div>
                </div>

                <SubmitBtn type="submit" isLoading={isLoading} buttonText="כניסה" error={error} />
            </form>

            <div className={styles.divider}>
                <span>או</span>
            </div>

            <button type="button" className={styles.googleButton} onClick={handleGoogleSignIn}>
                <GoogleIcon /> המשך עם Google
            </button>

            <div className={styles.registerLink}>
                <p>
                    בעיה בהתחברות?{" "}
                    <Link href={EmailLink} className={styles.problemLink}>
                        צרו קשר
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginForm;
