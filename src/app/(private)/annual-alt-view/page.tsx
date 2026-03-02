"use client";

import React from "react";
import { NextPage } from "next";
import styles from "./annualAltView.module.css";
import AnnualViewTable from "../../../components/tables/annualViewTable/AnnualViewTable/AnnualViewTable";
import { useMainContext } from "@/context/MainContext";
import { useAnnualAltView } from "@/context/AnnualAltViewContext";

const AnnualAltViewPage: NextPage = () => {
    const { classes, teachers, subjects } = useMainContext();
    const {
        schedule,
        selectedClassId,
        selectedTeacherId
    } = useAnnualAltView();

    const hasSelection = selectedClassId || selectedTeacherId;

    return (
        <div className={styles.container}>
            {hasSelection ? (
                <AnnualViewTable
                    schedule={schedule}
                    selectedClassId={selectedClassId}
                    selectedTeacherId={selectedTeacherId}
                    subjects={subjects}
                    teachers={teachers}
                    classes={classes}
                />
            ) : (
                <div className={styles.placeholder}>בחרו כיתה ו/או מורה כדי להציג את המערכת</div>
            )}
        </div>
    );
};

export default AnnualAltViewPage;
