import React from "react";
import styles from "./LoadingDots.module.css";
import { PopupSize } from "@/models/types/ui";

type LoadingDotsProps = {
    size?: PopupSize;
    color?: string;
};

const LoadingDots: React.FC<LoadingDotsProps> = ({ size = "M", color = "var(--loading-color)" }) => {
    return (
        <div
            className={styles.loader}
            style={{
                width: size === "S" ? "12px" : size === "M" ? "14px" : "16px",
                color: color,
            }}
        ></div>
    );
};

export default LoadingDots;
