import React from "react";
import styles from "./ThTableSelect.module.css";
import { Colors } from "@/models/types/table";

type ThTableSelectProps = {
    color: Colors;
};

const ThTableSelect: React.FC<ThTableSelectProps> = ({ color }) => {
    return (
        <th className={styles.th + " " + styles[color]}>
            <select className={styles.select + " " + styles[color]}>
                <option className={styles.option} value="">
                    בחר
                </option>
                <option className={styles.option} value="1">
                    1
                </option>
                <option className={styles.option} value="2">
                    2
                </option>
                <option className={styles.option} value="3">
                    3
                </option>
                <option className={styles.option} value="4">
                    4
                </option>
                <option className={styles.option} value="5">
                    5
                </option>
                <option className={styles.option} value="6">
                    6
                </option>
                <option className={styles.option} value="7">
                    7
                </option>
                <option className={styles.option} value="8">
                    8
                </option>
                <option className={styles.option} value="9">
                    9
                </option>
                <option className={styles.option} value="10">
                    10
                </option>
            </select>
        </th>
    );
};

export default ThTableSelect;
