import React from "react";
import styles from "./EmptyCell.module.css";

const EmptyCell: React.FC = () => {
    return <div aria-label="empty-cell" className={styles.emptyCell}></div>;
};

export default EmptyCell;
