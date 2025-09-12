import React from "react";
import styles from "./ViewHeader.module.css";

type ViewHeaderProps = {
    items: { title: string; color?: string }[];
};

const ViewHeader: React.FC<ViewHeaderProps> = ({ items }) => {
    return (
        <thead>
            <tr>
                {/* שעה */}
                <th className={styles.hourHeader}></th>
                {items.map((it, i) => (
                    <th
                        key={i}
                        className={styles.dayHeader}
                        style={{ background: it.color || "transparent" }}
                    >
                        {it.title || "—"}
                    </th>
                ))}
            </tr>
        </thead>
    );
};

export default ViewHeader;
