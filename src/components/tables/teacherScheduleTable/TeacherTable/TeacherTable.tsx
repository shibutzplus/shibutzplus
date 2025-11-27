"use client";

import React from "react";
import { TableRows } from "@/models/constant/table";
import TeacherHeader from "../TeacherHeader/TeacherHeader";
import TeacherRow from "../TeacherRow/TeacherRow";
import styles from "./TeacherTable.module.css";
import { usePortalContext } from "@/context/PortalContext";

const TeacherTable: React.FC = () => {
    const { selectedDate, mainPortalTable } = usePortalContext();
    const dayTable = selectedDate ? mainPortalTable[selectedDate] : undefined;
    const isDayLoaded = dayTable !== undefined;
    const hasData = isDayLoaded && Object.keys(dayTable).length > 0; //

    //     if (!hasData) {
    //     // If the day is not loaded yet, do not show the "no changes" text
    //     if (!isDayLoaded) {if (embedded) {if (isPortalLoading) {return <div className={styles.loader}></div>;}
    //             return null;}return null;}
    //     // In embedded mode show a small preloader while loading, otherwise show nothing
    //     if (embedded) {if (isPortalLoading) {return <div className={styles.loader}></div>;}return null;}
    //     // Regular screen "no data" message (only after the day was loaded)
    //     // return (
    //     //     <NotPublishedLayout
    //     //         title=""
    //     //         subTitle={["אין לך שינויים במערכת ליום זה"]}
    //     //     />
    //     // );
    // }

    return (
        <table className={styles.scheduleTable}>
            <TeacherHeader />
            <tbody className={styles.scheduleTableBody}>
                {Array.from({ length: TableRows }, (_, i) => i + 1).map((hour) => {
                    const row = dayTable?.[String(hour)];
                    return <TeacherRow key={hour} hour={hour} row={row} />;
                })}
            </tbody>
        </table>
    );
};

export default TeacherTable;
