"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { NextPage } from "next";
import InputText from "@/components/ui/inputs/InputText/InputText";
import SubmitBtn from "@/components/ui/buttons/SubmitBtn/SubmitBtn";
import DynamicInputSelect from "@/components/ui/select/InputSelect/DynamicInputSelect";
import styles from "./signUp.module.css";
import routePath from "../../../routes";
import { RegisterRequest, UserGender, UserRole } from "@/models/types/auth";
import { SchoolLevel } from "@/db/schema";
import { genderOptions, roleOptions } from "@/resources/onboarding";
import { registerSchema } from "@/models/validation/register";
import signUp from "@/app/actions/POST/signUpAction";
import { getSchoolsMinAction } from "@/app/actions/GET/getSchoolsMinAction";
import { logErrorAction } from "@/app/actions/POST/logErrorAction";

const SignUpPage: NextPage = () => {
    const router = useRouter();
    const [formData, setFormData] = useState<RegisterRequest>({
        name: "",
        email: "",
        password: "12345678",
        schoolName: "",
        city: "",
        role: "admin" as UserRole,
        gender: "female" as UserGender,
        level: "Elementary" as SchoolLevel,
    });
    const [error, setError] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState<
        Partial<Record<keyof RegisterRequest, string>>
    >({});
    const [schools, setSchools] = useState<Array<{ name: string; city: string }>>([]);

    // Derive disabled state from selected school
    const isCityDisabled = schools.some(s => s.name === formData.schoolName);

    useEffect(() => {
        const fetchSchools = async () => {
            try {
                const res = await getSchoolsMinAction();
                setSchools(res.map((s) => ({ name: s.name, city: s.city })));
            } catch (error) {
                logErrorAction({ description: `Failed to fetch schools (sign-up page): ${error instanceof Error ? error.message : String(error)}` });
            }
        };
        fetchSchools();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSchoolChange = (v: string) => {
        const selectedSchool = schools.find((s) => s.name === v);
        setFormData((prev) => ({
            ...prev,
            schoolName: v,
            city: selectedSchool ? selectedSchool.city : "",
        }));
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
            setError(res.message || "An unknown error occurred");
            setIsLoading(false);
            return;
        }
        router.push(routePath.signIn.p);
        setIsLoading(false);
    };

    return (
        <div className={styles.container}>
            <form className={styles.form} onSubmit={handleSubmit}>
                <DynamicInputSelect
                    label="שם בית ספר"
                    id="schoolName"
                    options={schools.map((s) => ({ value: s.name, label: s.name }))}
                    value={formData.schoolName}
                    onChange={handleSchoolChange}
                    placeholder="בחר או הקלד שם בית ספר חדש"
                    hasBorder={true}
                    error={validationErrors.schoolName}
                    isCreatable={true}
                    formatCreateLabel={(inputValue: string) => `צור "${inputValue}"`}
                />

                <InputText
                    label="עיר"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    error={validationErrors.city}
                    disabled={isCityDisabled}
                />

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
                    hasBorder={true}
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
                    hasBorder={true}
                />



                <SubmitBtn type="submit" isLoading={isLoading} buttonText="הוספה" error={error} />
            </form>
        </div>
    );
};

export default SignUpPage;
