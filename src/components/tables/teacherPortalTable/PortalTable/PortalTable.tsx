import React from "react";
import styles from "./PortalTable.module.css";
import { TableRows } from "@/models/constant/table";
import PortalWriteRow from "../PortalWriteRow/PortalWriteRow";
import { usePortal } from "@/context/PortalContext";

type Props = {
    embedded?: boolean; // render inside modal Div
};

const PortalTable: React.FC<Props> = ({ embedded = false }) => {
    const { mainPortalTable, selectedDate, isPortalLoading } = usePortal();
    const dayTable = selectedDate ? mainPortalTable[selectedDate] : undefined;
    const isDayLoaded = dayTable !== undefined;
    const hasData = isDayLoaded && Object.keys(dayTable).length > 0;

    if (!hasData) {
        // If the day is not loaded yet, do not show the "no changes" text
        if (!isDayLoaded) {
            if (embedded) {
                if (isPortalLoading) {
                    return <div className={styles.loader}></div>;
                }
                return null;
            }
            return null;
        }

        // In embedded mode show a small preloader while loading, otherwise show nothing
        if (embedded) {
            if (isPortalLoading) {
                // Minimal loader placeholder. Replace with your Loader component if exists.
                return <div className={styles.loader}></div>;
            }
            return null;
        }

        // Regular screen "no data" message (only after the day was loaded)
        // return (
        //     <NotPublishedLayout
        //         title=""
        //         subTitle={["אין לך שינויים במערכת ליום זה"]}
        //     />
        // );
    }

    return (
        <div
            className={`${styles.tableContainer} ${embedded ? styles.embeddedContainer : ""}`}
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
