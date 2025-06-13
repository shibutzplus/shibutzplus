import React from "react";
import styles from "./Logo.module.css";
import Image from "next/image";

type LogoProps = {
    size?: "S" | "M" | "L";
};

const Logo: React.FC<LogoProps> = ({ size = "M" }) => {
    const placeholderSize = {
        width: size === "S" ? 40 : size === "M" ? 60 : 80,
        height: size === "S" ? 40 : size === "M" ? 60 : 80,
    };
    const imageSize = size === "S" ? 20 : size === "M" ? 40 : 60;

    return (
        <div className={styles.iconPlaceholder} style={placeholderSize}>
            <Image
                src="/logo.png"
                alt="ShibutzPlus Logo"
                width={imageSize}
                height={imageSize}
                className={styles.logo}
            />
        </div>
    );
};

export default Logo;
