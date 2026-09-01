"use client";

import React, { useState } from "react";
import styles from "./Logo.module.css";
import Image from "next/image";
import { useOptionalMainContext } from "@/context/MainContext";

type LogoProps = {
    size?: "XS" | "S" | "L";
    isVisible?: boolean;
    schoolId?: string;
    schoolName?: string;
    schoolCity?: string;
    disableFlip?: boolean;
};

const SIZES = { XS: 30, S: 40, L: 80 } as const;

const Logo: React.FC<LogoProps> = ({
    size = "S",
    isVisible = true,
    schoolId: propSchoolId,
    schoolName: propSchoolName,
    schoolCity: propSchoolCity,
    disableFlip = false,
}) => {
    const mainContext = useOptionalMainContext();
    const effectiveSchoolId = propSchoolId || mainContext?.school?.id;
    const schoolName = propSchoolName || mainContext?.school?.name;
    const schoolCity = propSchoolCity || mainContext?.school?.city;

    const tooltipTitle = schoolName
        ? schoolCity
            ? `${schoolName} - ${schoolCity}`
            : schoolName
        : "בית ספר";

    const [hasSchoolLogoError, setHasSchoolLogoError] = useState(false);

    if (!isVisible) return null;

    const sizeClass = styles[`size${size}`];
    const imageSize = SIZES[size] || 40;
    const canFlip = !disableFlip && !!effectiveSchoolId && !hasSchoolLogoError;

    return (
        <div className={`${styles.iconPlaceholder} ${sizeClass}`}>
            {canFlip ? (
                <div className={styles.flipContainer} title={tooltipTitle}>
                    <div className={styles.flipInner}>
                        <div className={styles.flipFront}>
                            <Image
                                src="/logo.webp"
                                alt="ShibutzPlus Logo"
                                width={imageSize}
                                height={imageSize}
                                className={styles.logo}
                                priority
                            />
                        </div>
                        <div className={styles.flipBack}>
                            <Image
                                src={`/schoolsLogo/${effectiveSchoolId}.webp`}
                                alt={`לוגו ${tooltipTitle}`}
                                width={imageSize}
                                height={imageSize}
                                className={styles.logo}
                                onError={() => setHasSchoolLogoError(true)}
                                priority
                            />
                        </div>
                    </div>
                </div>
            ) : (
                <Image
                    src="/logo.webp"
                    alt="ShibutzPlus Logo"
                    width={imageSize}
                    height={imageSize}
                    className={styles.logo}
                    priority
                />
            )}
        </div>
    );
};

export default Logo;


