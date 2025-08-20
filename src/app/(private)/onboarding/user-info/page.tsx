"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../onboarding.module.css";
import InputText from "@/components/ui/InputText/InputText";
import SubmitBtn from "@/components/ui/SubmitBtn/SubmitBtn";
import { genderOptions, roleOptions } from "@/resources/onboarding";
import { useOnboarding } from "@/context/onboardingContext";
import { UserGender, UserRole } from "@/db/schema";
import router from "@/routes";
import DynamicInputSelect from "@/components/ui/InputSelect/DynamicInputSelect";

const UserInfoPage: React.FC = () => {
    const route = useRouter();
    const { fillUserInfo } = useOnboarding();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const [name, setName] = useState<string>("");
    const [gender, setGender] = useState<string>("");
    const [role, setRole] = useState<string>("");

    const handleNext = () => {
        setError("");
        setIsLoading(true);
        if (!name.trim() || !gender || !role) {
            setError("אנא מלא את כל השדות");
            setIsLoading(false);
            return;
        }
        fillUserInfo(name, gender as UserGender, role as UserRole);
        route.push(router.onboardingSchoolInfo.p);
        setIsLoading(false);
    };

    return (
        <>
            <div className={styles.header}>
                <h1 className={styles.title}>ברוכים הבאים לשיבוץ +</h1>
                <p className={styles.subtitle}>בואו נכיר אותך קצת יותר</p>
            </div>

            <div className={styles.form}>
                <InputText
                    label="שם מלא"
                    placeholder="הזן את שמך המלא"
                    value={name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                />

                <DynamicInputSelect
                    label="מגדר"
                    options={genderOptions}
                    value={gender}
                    onChange={setGender}
                    placeholder="בחר מגדר"
                    isSearchable={false}
                    hasBorder
                />
                <DynamicInputSelect
                    label="תפקיד"
                    options={roleOptions}
                    value={role}
                    onChange={setRole}
                    placeholder="בחר תפקיד"
                    isSearchable={false}
                    hasBorder
                />

                <SubmitBtn
                    type="button"
                    onClick={handleNext}
                    isLoading={isLoading}
                    buttonText="המשך"
                    error={error}
                    disabled={isLoading}
                />
            </div>

            <div className={styles.progress}>
                <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: "50%" }} />
                </div>
                <span className={styles.progressText}>שלב 1 מתוך 2</span>
            </div>
        </>
    );
};

export default UserInfoPage;
