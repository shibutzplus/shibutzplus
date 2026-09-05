//
//  Used in CommonDailySchoolTable (Public Portal and Manager History).
//  Renders a single column header in the daily changes PER CLASS view.
//

import React, { useRef } from "react";
import styles from "../CommonDailySchoolTeacherHeader/CommonDailySchoolTeacherHeader.module.css";
import { useStickyHeader } from "@/hooks/scroll/useStickyHeader";

type CommonDailySchoolClassHeaderProps = {
    classNameText: string;
};

const CommonDailySchoolClassHeader: React.FC<CommonDailySchoolClassHeaderProps> = ({
    classNameText,
}) => {
    const headerRef = useRef<HTMLDivElement>(null);
    useStickyHeader(headerRef);

    return (
        <div ref={headerRef} className={styles.columnHeaderWrapper} style={{ top: 0 }}>
            <div className={styles.columnHeader} style={{ backgroundColor: "#718096" }}>
                <div className={styles.headerText} style={{ textAlign: "center", paddingRight: 0 }}>
                    {classNameText}
                </div>
            </div>
        </div>
    );
};

export default CommonDailySchoolClassHeader;
