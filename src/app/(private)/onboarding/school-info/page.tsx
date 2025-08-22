"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "../onboarding.module.css";
import InputText from "@/components/ui/InputText/InputText";
import SubmitBtn from "@/components/ui/SubmitBtn/SubmitBtn";
import Link from "next/link";
import router from "@/routes";
import { useOnboarding } from "@/context/onboardingContext";
import { citiesOptions, schoolLevelOptions } from "@/resources/onboarding";
import DynamicInputSelect from "@/components/ui/InputSelect/DynamicInputSelect";
import { SchoolLevel } from "@/models/types/school";

const SchoolInfoPage: React.FC = () => {
    const route = useRouter();
    const { fullUser, fillSchoolInfo } = useOnboarding();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const [schoolName, setSchoolName] = useState("");
    const [city, setCity] = useState("");
    const [level, setLevel] = useState("");

    useEffect(() => {
        if (!fullUser) {
            route.push(router.onboardingUserInfo.p);
        }
    }, [route, fullUser]);

    const handleSubmit = async () => {
        setError("");
        setIsLoading(true);
        if (!schoolName.trim()) {
            setError("אנא הזן את שם בית הספר");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fillSchoolInfo(schoolName, level as SchoolLevel);
            if (response.success) {
                if (response.status === "onboarding-annual") {
                    route.push(router.annualSchedule.p);
                } else {
                    route.push(router.dailySchedule.p);
                }
            } else {
                setError("אירעה שגיאה בשמירת הנתונים");
            }
        } catch (error) {
            setError("אירעה שגיאה בשמירת הנתונים");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className={styles.header}>
                <h1 className={styles.title}>ברוכים הבאים לשיבוץ +</h1>
                <p className={styles.subtitle}>ספר לנו על בית הספר שלך</p>
            </div>

            <div className={styles.form}>
                {/* TODO need to be select with search */}
                <InputText
                    label="שם בית הספר"
                    placeholder="הזן את שם בית הספר"
                    value={schoolName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setSchoolName(e.target.value)
                    }
                />

                <DynamicInputSelect
                    label="מיקום"
                    options={citiesOptions}
                    onChange={setCity}
                    value={city}
                    placeholder="בחר את המיקום..."
                    hasBorder
                />

                <DynamicInputSelect
                    label="סוג בית הספר"
                    options={schoolLevelOptions}
                    onChange={setLevel}
                    value={level}
                    placeholder="בחר את סוג בית הספר..."
                    hasBorder
                />

                <SubmitBtn
                    type="button"
                    onClick={handleSubmit}
                    isLoading={isLoading}
                    buttonText={isLoading ? "שומר..." : "סיים"}
                    error={error}
                    disabled={isLoading}
                />
            </div>

            <div className={styles.progress}>
                <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: "100%" }} />
                </div>
                <span className={styles.progressText}>שלב 2 מתוך 2</span>
            </div>

            <div className={styles.navLink}>
                <Link href={router.onboardingUserInfo.p}>חזרה</Link>
            </div>
        </>
    );
};

export default SchoolInfoPage;
