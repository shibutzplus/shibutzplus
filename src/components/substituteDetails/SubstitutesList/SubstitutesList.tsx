"use client";

import React from "react";
import styles from "./SubstitutesList.module.css";
import { TeacherType } from "@/models/types/teachers";
import TableList from "../../core/TableList/TableList";
import { sortByHebrewName } from "@/utils/format";
import { successToast } from "@/lib/toast";
import { MdOutlineContentCopy } from "react-icons/md";
import { generateTeacherUrl } from "@/utils";


type SubstitutesListProps = {
    substitutes: TeacherType[];
};

const SubstitutesList: React.FC<SubstitutesListProps> = ({ substitutes }) => {

    const handleCopyUrl = async (teacherId: string, teacherName: string) => {
        try {
            const url = generateTeacherUrl(teacherId);
            await navigator.clipboard.writeText(url);
            successToast(`הקישור של ${teacherName} הועתק בהצלחה`);
        } catch (error) {
            console.error("Failed to copy URL:", error);
        }
    };

    const sortedSubstitutes = sortByHebrewName(substitutes);

    return (
        <TableList headThs={["שם מורה מחליף", "קישור אישי", ""]}>
            <tbody>
                {sortedSubstitutes.map((substitute) => (
                    <tr key={substitute.id} className={styles.substituteRow}>
                        <td className={styles.nameCell}>{substitute.name}</td>
                        <td className={styles.urlCell}>
                            <span className={styles.url}>
                                {generateTeacherUrl(substitute.id)}
                            </span>
                        </td>
                        <td className={styles.actionCell}>
                            <button
                                className={styles.copyBtn}
                                onClick={() => handleCopyUrl(substitute.id, substitute.name)}
                                title="העתק קישור"
                            >
                                <MdOutlineContentCopy size={16}/>
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </TableList>
    );
};

export default SubstitutesList;
