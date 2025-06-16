"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./forget.module.css";
import Logo from "@/components/core/Logo/Logo";
import { IoArrowForward } from "react-icons/io5";
import { EmailLink, OurEmail } from "@/models/constant";
import routePath from "../../../routes";
import { NextPage } from "next";

const ForgetPasswordPage: NextPage = () => {
    return (
        <main className={styles.container}>
            <div className={styles.contentWrapper}>
                <div className={styles.backLinkContainer}>
                    <Link href={routePath.signIn.p} className={styles.backLink}>
                        <IoArrowForward className={styles.backIcon} />
                        <span>חזרה לדף התחברות</span>
                    </Link>
                </div>
                <div className={styles.forgetContainer}>
                    <div className={styles.logoContainer}>
                        <Logo size="M" />
                    </div>

                    <h1 className={styles.title}>מה עושים במקרה ושכחתי את הסיסמה?</h1>
                    <h2 className={styles.subtitle}>צרו קשר עם שירות הלקוחות של שיבוץ+</h2>

                    <Link href={EmailLink} className={styles.emailLink}>
                        {OurEmail}
                    </Link>

                    <div className={styles.illustrationContainer}>
                        <Image
                            src="/undraw_search-engines_k649.svg"
                            alt="Workspace Illustration"
                            width={300}
                            height={200}
                            className={styles.illustration}
                        />
                    </div>
                </div>
            </div>
        </main>
    );
};

export default ForgetPasswordPage;

//icon colors
//#dfdfe0
// #6c63ff
// #36344e

// #090814
// #ffb6b6