import React from "react";
import styles from "./Loading.module.css";
import { PopupSize } from "@/models/types/ui";

type LoadingProps = {
    size?: PopupSize;
};

const Loading: React.FC<LoadingProps> = ({ size = "M" }) => {
    return (
        <div
            className={styles.loader}
            style={{
                width: size === "S" ? "20px" : size === "M" ? "25px" : "30px",
                borderWidth: size === "S" ? 2 : size === "M" ? 3 : 4,
            }}
        ></div>
    );
};

export default Loading;
