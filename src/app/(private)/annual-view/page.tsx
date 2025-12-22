"use client";

import React from "react";
import { NextPage } from "next";
import styles from "./annualView.module.css";
import AnnualViewTable from "../../../components/tables/annualViewTable/AnnualViewTable/AnnualViewTable";
import { useMainContext } from "@/context/MainContext";
import { useAnnualView } from "@/context/AnnualViewContext";

const AnnualViewPage: NextPage = () => {
    const { classes, teachers, subjects } = useMainContext();
    const {
        schedule,
        selectedClassId,
        selectedTeacherId,
        setIsLoading
    } = useAnnualView();

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
                    setIsLoading={setIsLoading as React.Dispatch<React.SetStateAction<boolean>>}
                />
            ) : (
                <div className={styles.placeholder}>בחרו כיתה ו/או מורה כדי להציג את המערכת</div>
            )}
        </div>
    );
};

export default AnnualViewPage;
