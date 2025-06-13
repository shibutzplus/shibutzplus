import React from "react";
import styles from "./TdTable.module.css";

type TdTableProps = {
    text: string;
};

const TdTable: React.FC<TdTableProps> = ({ text }) => {
    return <td className={styles.td}>{text}</td>;
};

export default TdTable;
