import React from "react";
import styles from "./EmptyList.module.css";
import Icons from "@/style/icons";

type EmptyListProps = {
    text: string | React.ReactNode;
};

const EmptyList = ({ text }: EmptyListProps) => {
    return <div className={styles.empty}>{text}</div>;
};

export default EmptyList;
