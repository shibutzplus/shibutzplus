"use client";

import React, { useState, useMemo } from "react";
import { NextPage } from "next";
import { ClassType } from "@/models/types/classes";
import ClassesForm from "@/components/classDetails/ClassesForm/ClassesForm";
import ClassesList from "@/components/classDetails/ClassesList/ClassesList";
import ManagementLayout from "@/components/layout/ManagementLayout/ManagementLayout";
import { useMainContext } from "@/context/MainContext";

const ClassesPage: NextPage = () => {
    const { classes } = useMainContext();
    const [selectedClass, setSelectedClass] = useState<ClassType | null>(null);

    const handleSelectClass = (classItem: ClassType) => {
        setSelectedClass(classItem);
    };

    const listInfo = useMemo(() => {
        return `${classes?.length || 0} כיתות`;
    }, [classes]);

    return (
        <ManagementLayout
            formTitle="הוספת כיתה"
            listTitle="רשימת כיתות"
            listInfo={listInfo}
            children={[
                <ClassesList 
                    key="classes-list"
                    classes={classes || []} 
                    handleSelectClass={handleSelectClass} 
                />,
                <ClassesForm 
                    key="classes-form"
                    selectedClass={selectedClass} 
                />,
            ]}
        />
    );
};

export default ClassesPage;
