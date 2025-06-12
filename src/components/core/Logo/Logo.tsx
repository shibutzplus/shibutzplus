import React from "react";
import styles from "./Logo.module.css";
import Image from "next/image";

type LogoProps = {
    size?: "S" | "M" | "L";
};

const Logo: React.FC<LogoProps> = ({ size = "M" }) => {
    return (
        <div className={styles.iconPlaceholder}>
            <Image
                src="/logo.png"
                alt="ShibutzPlus Logo"
                width={size === "S" ? 20 : size === "M" ? 40 : 60}
                height={size === "S" ? 20 : size === "M" ? 40 : 60}
                className={styles.logo}
            />
        </div>
    );
};

export default Logo;
