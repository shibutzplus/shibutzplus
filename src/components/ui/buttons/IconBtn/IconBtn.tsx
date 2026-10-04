import React from "react";
import styles from "./IconBtn.module.css";
import Loading from "@/components/loading/Loading/Loading";

type IconBtnProps = {
    Icon: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
    isLoading?: boolean;
    hasBorder?: boolean;
    title?: string;
    style?: React.CSSProperties;
    className?: string;
};

const IconBtn: React.FC<IconBtnProps> = ({
    Icon,
    onClick,
    disabled,
    isLoading,
    hasBorder = false,
    title,
    style,
    className,
}) => {
    return (
        <button
            className={`${styles.iconBtn}${hasBorder ? " " + styles.hasBorder : ""}${className ? " " + className : ""}`}
            onClick={onClick}
            disabled={disabled}
            title={title}
            style={style}
        >
            {isLoading ? <Loading size="S" /> : Icon}
        </button>
    );
};

export default IconBtn;

