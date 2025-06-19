"use client";

import React, { useState, useMemo } from "react";
import { NextPage } from "next";
import { Class } from "@/models/types/classes";
import ClassesForm from "@/components/ClassesForm/ClassesForm";
import ClassesList from "@/components/ClassesList/ClassesList";
import ManagementLayout from "@/components/layout/ManagementLayout/ManagementLayout";

// Sample data
const initialClasses: Class[] = [
    {
        id: "1",
        name: "א1",
    },
    {
        id: "2",
        name: "א2",
    },
    {
        id: "3",
        name: "ב1",
    },
    {
        id: "4",
        name: "ב2",
    },
    {
        id: "5",
        name: "ג1",
    },
    {
        id: "6",
        name: "ג2",
    },
];

const ClassesPage: NextPage = () => {
    const [classes, setClasses] = useState<Class[]>(initialClasses);
    const [selectedClass, setSelectedClass] = useState<Class | null>(null);

    const handleSelectClass = (classItem: Class) => {
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
