import React from "react";
import styles from "./IconBtn.module.css";
import Loading from "@/components/core/Loading/Loading";

type IconBtnProps = {
    Icon: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
    isLoading?: boolean;
    hasBorder?: boolean;
};

const IconBtn: React.FC<IconBtnProps> = ({
    Icon,
    onClick,
    disabled,
    isLoading,
    hasBorder = false,
}) => {
    return (
        <button
            className={styles.iconBtn + (hasBorder ? " " + styles.hasBorder : "")}
            onClick={onClick}
            disabled={disabled}
        >
            {isLoading ? <Loading size="S" /> : Icon}
        </button>
    );
};

export default IconBtn;
