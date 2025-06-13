import React from "react";
import styles from "./TdTableSplit.module.css";

type TdTableSplitProps = {
    text: string[];
};

const TdTableSplit: React.FC<TdTableSplitProps> = ({ text }) => {
    return (
        <td className={styles.td}>
            {text.map((item, index) => (
                <span className={styles.item} key={index}>
                    {item}
                </span>
            ))}
        </td>
    );
};

export default TdTableSplit;
