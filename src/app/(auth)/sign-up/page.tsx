"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import InputText from "@/components/ui/inputs/InputText/InputText";
import InputPassword from "@/components/ui/inputs/InputPassword/InputPassword";
import SubmitBtn from "@/components/ui/buttons/SubmitBtn/SubmitBtn";
import styles from "./signUp.module.css";
import routePath from "../../../routes";
import { NextPage } from "next";
import { RegisterRequest, UserGender, UserRole } from "@/models/types/auth";
import signUp from "@/app/actions/POST/signUpAction";
import DynamicInputSelect from "@/components/ui/select/InputSelect/DynamicInputSelect";
import { SchoolLevel } from "@/db/schema";
import { genderOptions, roleOptions, schoolLevelOptions } from "@/resources/onboarding";
import { registerSchema } from "@/models/validation/register";

const SignUpPage: NextPage = () => {
    const router = useRouter();
    const [formData, setFormData] = useState<RegisterRequest>({
        systemPassword: "",
        name: "",
        email: "",
        password: "",
        schoolName: "",
        role: "admin" as UserRole,
        gender: "female" as UserGender,
        level: "Elementary" as SchoolLevel,
    });
    const [error, setError] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState<
        Partial<Record<keyof RegisterRequest, string>>
    >({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setValidationErrors({});
        setIsLoading(true);

        const validationResult = registerSchema.safeParse(formData);
        if (!validationResult.success) {
            const fieldErrors: Partial<Record<keyof RegisterRequest, string>> = {};
            validationResult.error.issues.forEach((issue) => {
                const field = issue.path[0] as keyof RegisterRequest;
                fieldErrors[field] = issue.message;
            });
            setValidationErrors(fieldErrors);
            setIsLoading(false);
            return;
        }

        const res = await signUp(formData);

        if (!res.success) {
            setError(res.message);
            setIsLoading(false);
            return;
        }
        router.push(routePath.signIn.p);
        setIsLoading(false);
    };

    return (
        <div className={styles.container}>
            <form className={styles.form} onSubmit={handleSubmit}>
                <InputText
                    label="שם מלא"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    error={validationErrors.name}
                />

                <InputText
                    label="כתובת אימייל"
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    error={validationErrors.email}
                />

                <InputPassword
                    label="סיסמה"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    error={validationErrors.password}
                />

                <DynamicInputSelect
                    label="מגדר"
                    options={genderOptions}
                    value={formData.gender}
                    onChange={(v: string) =>
                        setFormData((prev) => ({
                            ...prev,
                            gender: v as UserGender,
                        }))
                    }
                    placeholder="בחר מגדר"
                    isSearchable={false}
                    hasBorder
                />

                <DynamicInputSelect
                    label="תפקיד"
                    options={roleOptions}
                    value={formData.role}
                    onChange={(v: string) =>
                        setFormData((prev) => ({
                            ...prev,
                            role: v as UserRole,
                        }))
                    }
                    placeholder="בחר תפקיד"
                    isSearchable={false}
                    hasBorder
                />

                <InputText
                    label="שם בית ספר"
                    id="schoolName"
                    name="schoolName"
                    value={formData.schoolName}
                    onChange={handleChange}
                    required
                    error={validationErrors.schoolName}
                />

                <DynamicInputSelect
                    label="סוג בית ספר"
                    options={schoolLevelOptions}
                    value={formData.level}
                    onChange={(v: string) =>
                        setFormData((prev) => ({
                            ...prev,
                            level: v as SchoolLevel,
                        }))
                    }
                    placeholder="בחר את סוג בית הספר..."
                    hasBorder
                />

                <br />

                <InputPassword
                    label="סיסמת מערכת"
                    id="systemPassword"
                    name="systemPassword"
                    value={formData.systemPassword}
                    onChange={handleChange}
                    required
                    error={validationErrors.systemPassword}
                />

                <SubmitBtn type="submit" isLoading={isLoading} buttonText="הרשמה" error={error} />
            </form>
        </div>
    );
};

export default SignUpPage;
