import React from "react";
import Link from "next/link";
import styles from "./about.module.css";
import routePath from "../../../routes";
import Image from "next/image";
import ThTable from "@/components/table/ThTable/ThTable";
import TdTable from "@/components/table/TdTable/TdTable";
import ThTableSelect from "@/components/table/ThTableSelect/ThTableSelect";
import TdTableSelect from "@/components/table/TdTableSelect/TdTableSelect";
import TdTableSplit from "@/components/table/TdTableSplit/TdTableSplit";

const AboutPage: React.FC = () => {
    return (
        <main className={styles.container}>
            <div className={styles.contentWrapper}>
                <div className={styles.tableContainer}>
                    <h1 className={styles.title}>נתוני המערכת</h1>
                    <p className={styles.subtitle}>מידע על המערכת ותכונותיה</p>

                    <div className={styles.tableWrapper}>
                        <table className={styles.dataTable}>
                            <thead>
                                <tr>
                                    <th className={styles.thDays}>day 1</th>
                                    <ThTable color="yellow" title="תכונה" />
                                    <ThTableSelect color="red" />
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className={styles.tdDay}>1</td>
                                    <TdTableSplit text={["hey", "roy"]} />
                                    <TdTable text="מעל 1,000 משתמשים פעילים" color="red" />
                                </tr>
                                <tr>
                                    <td className={styles.tdDay}>2</td>
                                    <TdTableSelect />
                                    <TdTable text="למעלה מ-50 בתי ספר" color="red" />
                                </tr>
                                <tr>
                                    <td className={styles.tdDay}>3</td>
                                    <TdTableSelect />
                                    <TdTable text="24/7 עם תמיכה טכנית" color="red" />
                                </tr>
                                <tr>
                                    <td className={styles.tdDay}>4</td>
                                    <TdTableSelect />
                                    <TdTable text="עדכוני מערכת חודשיים" color="red" />
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default AboutPage;
