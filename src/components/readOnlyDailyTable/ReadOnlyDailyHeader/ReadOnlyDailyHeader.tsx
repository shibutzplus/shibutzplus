"use client";

import React from "react";
import styles from "./ReadOnlyDailyHeader.module.css";

type Props = {
    items: { title: string; color?: string }[];
};

export default function ReadOnlyDailyHeader({ items }: Props) {
    return (
        <thead>
            <tr>
                {/* שעה */}
                <th className={styles.hourHeader}></th>
                {items.map((it, i) => (
                    <th key={i} className={styles.dayHeader} style={{ background: it.color || "transparent" }}>
                        {it.title || "—"}
                    </th>
                ))}
            </tr>
        </thead>
    );
}
