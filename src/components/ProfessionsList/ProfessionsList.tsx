"use client";

import React from "react";
import styles from "./ProfessionsList.module.css";
import { Profession } from "@/models/types/professions";
import { usePopup } from "@/context/PopupContext";
import TableList from "../core/TableList/TableList";
import DeleteProfessionPopup from "../popups/DeleteProfessionPopup/DeleteProfessionPopup";

type ProfessionsListProps = {
    professions: Profession[];
    handleSelectProfession: (profession: Profession) => void;
};

const ProfessionsList: React.FC<ProfessionsListProps> = ({ professions, handleSelectProfession }) => {
    const { openPopup } = usePopup();

    const handleOpenPopup = (profession: Profession) => {
        openPopup(
            "deleteProfession",
            "S",
            <DeleteProfessionPopup profession={profession} onDelete={() => {}} onCancel={() => {}} />,
        );
    };

    const handleDeleteProfession = (e: React.MouseEvent, profession: Profession) => {
        e.stopPropagation(); // Prevent row click when clicking delete
        handleOpenPopup(profession);
    };

    return (
        <TableList headThs={["שם מקצוע", ""]}>
            <tbody>
                {professions.map((profession) => (
                    <tr
                        key={profession.id}
                        className={styles.professionRow}
                        onClick={() => handleSelectProfession(profession)}
                    >
                        <td>{profession.name}</td>
                        <td>
                            <button
                                className={styles.deleteBtn}
                                aria-label="מחק"
                                onClick={(e) => handleDeleteProfession(e, profession)}
                            >
                                מחיקה
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </TableList>
    );
};

export default ProfessionsList;
