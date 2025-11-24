import React from "react";
import styles from "./HoursCol.module.css";

type Props = {
    hours: number;
};

const HoursCol: React.FC<Props> = ({ hours }) => {
    const hourNumbers = Array.from({ length: hours }, (_, index) => index + 1);

    return (
        <div className={styles.overlay}>
            <div className={styles.backgroundHidden} />
            <div className={styles.topHidden} />
            <div className={styles.hoursColumn}>
                {hourNumbers.map((hour) => (
                    <div key={hour} className={styles.hourCell}>
                        {hour}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HoursCol;
