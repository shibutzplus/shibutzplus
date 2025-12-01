"use client";

import React from "react";
import styles from "./Logo.module.css";
import Image from "next/image";


import Link from "next/link";
import { usePathname } from "next/navigation";
import router from "@/routes";
import { getStorageTeacher } from "@/lib/localStorage";

type LogoProps = {
    size?: "S" | "L";
    isVisible?: boolean;
};

const Logo: React.FC<LogoProps> = ({ size = "S", isVisible = true }) => {
    const pathname = usePathname();

    if (!isVisible) return null;

    const sizeClass = styles[`size${size}`];
    const imageSize = size === "S" ? 40 : 80;

    const isPublic =
        pathname.includes(router.teacherPortal.p) ||
        pathname.includes(router.publishedPortal.p) ||
        pathname.includes(router.teacherSignIn.p) ||
        pathname.includes("/faqTeachers");

    let linkTo = isPublic ? "/faqTeachers" : "/faqManager";

    if (pathname.includes("/faqTeachers")) {
        const teacher = getStorageTeacher();
        if (teacher) {
            linkTo = `${router.teacherPortal.p}/${teacher.schoolId}/${teacher.id}`;
        } else {
            linkTo = router.teacherSignIn.p;
        }
    } else if (pathname.includes("/faqManager")) {
        linkTo = router.dailySchedule.p;
    }

    return (
        <Link href={linkTo} className={`${styles.iconPlaceholder} ${sizeClass}`}>
            <Image
                src="/logo.webp"
                alt="ShibutzPlus Logo"
                width={imageSize}
                height={imageSize}
                className={styles.logo}
            />
        </Link>
    );
};

export default Logo;
