import React from "react";
import styles from "./IconBtn.module.css";
import Loading from "@/components/core/Loading/Loading";

type IconBtnProps = {
    Icon: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
    isLoading?: boolean;
    hasBorder?: boolean;
    title?: string;
};

const IconBtn: React.FC<IconBtnProps> = ({
    Icon,
    onClick,
    disabled,
    isLoading,
    hasBorder = false,
    title,
}) => {
    return (
        <button
            className={styles.iconBtn + (hasBorder ? " " + styles.hasBorder : "")}
            onClick={onClick}
            disabled={disabled}
            title={title}
        >
            {isLoading ? <Loading size="S" /> : Icon}
        </button>
    );
};

export default IconBtn;

