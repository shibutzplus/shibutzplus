//
// Used in Daily Schedule (Edit & Preview Modes) & History
//
"use client";

import React, { useRef } from "react";
import styles from "./HoursCol.module.css";
import { useStickyHeader } from "@/hooks/scroll/useStickyHeader";

type Props = {
    hours: number;
};

const HoursCol: React.FC<Props> = ({ hours }) => {
    const hourNumbers = Array.from({ length: hours }, (_, index) => index + 1);
    const hideTopRef = useRef<HTMLDivElement>(null);

    useStickyHeader(hideTopRef);

    return (
        <div className={styles.overlay}>
            <div className={styles.hideBackground} />

            <div ref={hideTopRef} className={styles.hideTop} />
            <div className={styles.hoursColumn}>
                {hourNumbers.map((hour) => (
                    <div key={hour} className={styles.hourRowContainer}>
                        <div className={styles.hourCell}>{hour}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HoursCol;
