import React from "react";
import { NextPage } from "next";
import ClassesList from "@/components/classDetails/ClassesList/ClassesList";
import ManagementLayout from "@/components/layout/ManagementLayout/ManagementLayout";

const ClassesPage: NextPage = () => {
    return (
        <ManagementLayout>
            <ClassesList />
        </ManagementLayout>
    );
};

export default ClassesPage;
