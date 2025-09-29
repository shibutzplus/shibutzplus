import React from "react";
import styles from "./PortalTable.module.css";
import { TableRows } from "@/models/constant/table";
import PortalWriteRow from "../PortalWriteRow/PortalWriteRow";
import { usePortal } from "@/context/PortalContext";
import NotPublishedLayout from "@/components/layout/NotPublishedLayout/NotPublishedLayout";

type Props = {
    embedded?: boolean; // render inside modal Div
};

const PortalTable: React.FC<Props> = ({ embedded = false }) => {
    const { mainPortalTable, selectedDate, isPortalLoading } = usePortal(); // use loader state
    const dayTable = selectedDate ? mainPortalTable[selectedDate] : undefined;
    const hasData = !!dayTable && Object.keys(dayTable).length > 0;

    if (!hasData) {
        // In embedded mode show a small preloader while loading, otherwise show nothing
        if (embedded) {
            if (isPortalLoading) {
                // Minimal loader placeholder. Replace with your Loader component if exists.
                return <div className={styles.loader}></div>;
            }
            return null;
        }
        // Regular screen "no data" message
        return (
            <NotPublishedLayout
                title=""
                subTitle={["אין לך שינויים במערכת השעות להיום"]}
            />
        );
    }

    return (
        <div
            className={`${styles.tableContainer} ${embedded ? styles.embeddedContainer : ""
                }`}
            role="region"
        >
            <table className={styles.scheduleTable}>
                <thead>
                    <tr>
                        <th></th>
                        <th>שיעור</th>
                        <th>חומר הלימוד</th>
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
