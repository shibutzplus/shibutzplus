import React from "react";
import styles from "./TdTable.module.css";
import { Colors } from "@/models/types/table";

type TdTableProps = {
    text: string;
    color: Colors;
};

const TdTable: React.FC<TdTableProps> = ({ text, color }) => {
    return <td className={styles.td + " " + styles[color]}>{text}</td>;
};

export default TdTable;
