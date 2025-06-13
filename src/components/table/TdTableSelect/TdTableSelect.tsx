import React from "react";
import styles from "./TdTableSelect.module.css";

type TdTableSelectProps = {};

const TdTableSelect: React.FC<TdTableSelectProps> = () => {
    return (
        <td className={styles.td}>
            <div className={styles.gridContainer}>
                {/* Row 1: input | input | select */}
                <input type="text" className={`${styles.inputClass} ${styles.input1}`} />
                <input type="text" className={`${styles.inputName} ${styles.input2}`} />
                <select className={`${styles.select} ${styles.selectRow1}`}>
                    <option className={styles.option} value="">
                        בחר
                    </option>
                    <option className={styles.option} value="1">
                        1
                    </option>
                    <option className={styles.option} value="2">
                        2
                    </option>
                </select>

                {/* Row 2: empty | empty | select */}
                <select className={`${styles.select} ${styles.selectRow2}`}>
                    <option className={styles.option} value="">
                        בחר
                    </option>
                    <option className={styles.option} value="1">
                        1
                    </option>
                    <option className={styles.option} value="2">
                        2
                    </option>
                </select>

                {/* Row 3: empty | empty | select */}
                <select className={`${styles.select} ${styles.selectRow3}`}>
                    <option className={styles.option} value="">
                        בחר
                    </option>
                    <option className={styles.option} value="1">
                        1
                    </option>
                    <option className={styles.option} value="2">
                        2
                    </option>
                </select>
            </div>
        </td>
    );
};

export default TdTableSelect;
