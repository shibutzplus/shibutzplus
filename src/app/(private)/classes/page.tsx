"use client";

import React, { useState, useMemo } from "react";
import { NextPage } from "next";
import { ClassType } from "@/models/types/classes";
import ClassesForm from "@/components/ClassesForm/ClassesForm";
import ClassesList from "@/components/ClassesList/ClassesList";
import ManagementLayout from "@/components/layout/ManagementLayout/ManagementLayout";

const ClassesPage: NextPage = () => {
    const [classes, setClasses] = useState<ClassType[]>([]);
    const [selectedClass, setSelectedClass] = useState<ClassType | null>(null);

    const handleSelectClass = (classItem: ClassType) => {
        setSelectedClass(classItem);
    };

    const listInfo = useMemo(() => {
        return `${classes.length} כיתות`;
    }, [classes]);

    return (
        <ManagementLayout
            formTitle="הוספת כיתה"
            listTitle="רשימת כיתות"
            listInfo={listInfo}
            children={[
                <ClassesList classes={classes} handleSelectClass={handleSelectClass} />,
                <ClassesForm setClasses={setClasses} selectedClass={selectedClass} />,
            ]}
        />
    );
};

export default ClassesPage;
