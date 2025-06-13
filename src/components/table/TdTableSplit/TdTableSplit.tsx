import React from "react";
import styles from "./TdTableSplit.module.css";

type TdTableSplitProps = {
    text: string[] | string;
};

const TdTableSplit: React.FC<TdTableSplitProps> = ({ text }) => {
    return (
        <td className={styles.td}>
            {Array.isArray(text) ? text.map((item, index) => (
                <span className={styles.item} key={index}>
                    {item}
                </span>
            )) : text}
        </td>
    );
};

export default TdTableSplit;
