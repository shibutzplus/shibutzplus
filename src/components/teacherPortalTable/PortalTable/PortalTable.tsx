import React from "react";
import styles from "./PortalTable.module.css";
import { TableRows } from "@/models/constant/table";
import PortalWriteRow from "../PortalWriteRow/PortalWriteRow";
import { usePortal } from "@/context/PortalContext";

const PortalTable: React.FC = () => {
    const { mainPortalTable, selectedDate, isLoading } = usePortal();

    const dayTable = selectedDate ? mainPortalTable[selectedDate] : undefined;
    const hasData = !!dayTable && Object.keys(dayTable).length > 0;

    if (!hasData && !isLoading)
        return (
            <div className={styles.noDataMessage}>
                אין נתונים להצגה <br /> לא פורסמה מערכת
            </div>
        );

    return (
        <div className={styles.tableContainer} role="region">
            <table className={styles.scheduleTable}>
                <thead>
                    <tr>
                        <th></th>
                        <th>שיעור</th>
                        <th>הזנת חומר לימוד</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: TableRows }, (_, i) => i + 1).map((hour) => {
                        const row = dayTable?.[String(hour)];
                        return <PortalWriteRow key={hour} hour={hour} row={row} />;
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default PortalTable;
