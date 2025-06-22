"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import InputText from "@/components/ui/InputText/InputText";
import InputPassword from "@/components/ui/InputPassword/InputPassword";
import InputSelect from "@/components/ui/InputSelect/InputSelect";
import SubmitBtn from "@/components/ui/SubmitBtn/SubmitBtn";
import styles from "./signUp.module.css";
import routePath from "../../../routes";
import { NextPage } from "next";
import { RegisterRequest, UserGender, UserRole } from "@/models/types/auth";
import signUp from "@/lib/actions/singUpAction";
import RadioGroup from "@/components/ui/RadioGroup/RadioGroup";

const SignUpPage: NextPage = () => {
    const router = useRouter();
    const [formData, setFormData] = useState<RegisterRequest>({
        name: "",
        email: "",
        password: "",
        role: "admin" as UserRole,
        gender: "female" as UserGender,
        school: "",
    });
    const [error, setError] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        const res = await signUp(formData);

        if (!res.success) {
            setError(res.message);
            return;
        }
        router.push(routePath.signIn.p);
        setIsLoading(false);
    };

    return (
        <div className={styles.container}>
            <div className={styles.formContainer}>
                <h1 className={styles.title}>הרשמה</h1>
                <form className={styles.form} onSubmit={handleSubmit}>
                    <InputText
                        label="שם מלא"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />

                    <InputText
                        label="כתובת אימייל"
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <InputPassword
                        label="סיסמה"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                    <InputSelect
                        label="תפקיד"
                        id="role"
                        value={formData.role}
                        placeholder="בחר תפקיד"
                        options={[
                            { value: "admin", label: "מנהל/ת" },
                            { value: "teacher", label: "מורה" },
                        ]}
                    />

                    <InputText
                        label="שם בית ספר"
                        id="school"
                        name="school"
                        value={formData.school}
                        onChange={handleChange}
                        required
                    />

                    <RadioGroup
                        label="מין"
                        name="gender"
                        value={formData.gender}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setFormData((prev) => ({
                                ...prev,
                                gender: e.target.value as UserGender,
                            }));
                        }}
                        options={[
                            { value: "male", label: "זכר" },
                            { value: "female", label: "נקבה" },
                        ]}
                    />

                    <SubmitBtn
                        type="submit"
                        isLoading={isLoading}
                        loadingText="הירשם..."
                        buttonText="הירשם"
                        error={error}
                    />
                </form>
            </div>
        </div>
    );
};

export default SignUpPage;
