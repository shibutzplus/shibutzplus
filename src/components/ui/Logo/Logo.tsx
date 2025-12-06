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
    const [linkTo, setLinkTo] = React.useState<string>(router.dailySchedule.p);

    React.useEffect(() => {
        const isPublic =
            pathname.includes(router.teacherPortal.p) ||
            pathname.includes(router.publishedPortal.p) ||
            pathname.includes(router.teacherSignIn.p) ||
            pathname.includes("/faqTeachers");

        let newLink = isPublic ? "/faqTeachers" : "/faqManager";

        if (pathname.includes("/faqTeachers")) {
            const teacher = getStorageTeacher();
            if (teacher) {
                newLink = `${router.teacherPortal.p}/${teacher.schoolId}/${teacher.id}`;
            } else {
                newLink = router.teacherSignIn.p;
            }
        } else if (pathname.includes("/faqManager")) {
            newLink = router.dailySchedule.p;
        }
        setLinkTo(newLink);
    }, [pathname]);

    if (!isVisible) return null;

    const sizeClass = styles[`size${size}`];
    const imageSize = size === "S" ? 40 : 80;

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
