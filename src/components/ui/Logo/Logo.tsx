"use client";

import React from "react";
import styles from "./Logo.module.css";
import Image from "next/image";

type LogoProps = {
    size?: "XS" | "S" | "L";
    isVisible?: boolean;
};

const Logo: React.FC<LogoProps> = ({ size = "S", isVisible = true }) => {
    if (!isVisible) return null;

    const sizeClass = styles[`size${size}`];
    const imageSize = size === "S" ? 40 : size === "L" ? 80 : 30;

    return (
        <div className={`${styles.iconPlaceholder} ${sizeClass}`}>
            <Image
                src="/logo.webp"
                alt="ShibutzPlus Logo"
                width={imageSize}
                height={imageSize}
                className={styles.logo}
            />
        </div>
    );
};

export default Logo;
