import React from "react";
import styles from "./ThTable.module.css";
import { Colors } from "@/models/types/table";

type ThTableProps = {
    color: Colors;
    title: string;
}

const ThTable: React.FC<ThTableProps> = ({ color, title }) => {
    return <th className={styles.th + " " + styles[color]}>{title}</th>;
};

export default ThTable;
