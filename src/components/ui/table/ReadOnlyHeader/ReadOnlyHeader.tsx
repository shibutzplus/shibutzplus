import React from "react";
import styles from "./ReadOnlyHeader.module.css";
import { AnnualTableColors } from "@/style/tableColors";

type ReadOnlyHeaderProps = {
    trs: any[];
    emptyTrs?: number;
    textPlaceholder: (text: string) => string;
    hasHour?: boolean;
};

const ReadOnlyHeader: React.FC<ReadOnlyHeaderProps> = ({ trs, emptyTrs = 0, textPlaceholder, hasHour = false }) => {
    return (
        <thead>
            <tr>
                {hasHour ? <th className={styles.emptyTrHeader}></th> : null}   {/* add "Hour" column */}
                {Array.from({ length: emptyTrs }, (_, i) => i).map((i) => (
                    <th key={i} className={styles.emptyTrHeader}></th>
                ))}
                {trs.map((tr: string) => (
                    <th
                        key={tr}
                        className={styles.trHeader}
                        style={{ backgroundColor: AnnualTableColors[trs.indexOf(tr)] }}
                    >
                        {textPlaceholder(tr)}
                    </th>
                ))}
            </tr>
        </thead>
    );
};

export default ReadOnlyHeader;
