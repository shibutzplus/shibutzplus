import React from "react";
import styles from "./PortalTable.module.css";
import { TableRows } from "@/models/constant/table";
import PortalWriteRow from "../PortalWriteRow/PortalWriteRow";
import { usePortal } from "@/context/PortalContext";

const PortalTable: React.FC = () => {
    const { mainPortalTable, selectedDate } = usePortal();
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
                        const row = mainPortalTable[selectedDate]?.[String(hour)];
                        return <PortalWriteRow key={hour} hour={hour} row={row} />;
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default PortalTable;
