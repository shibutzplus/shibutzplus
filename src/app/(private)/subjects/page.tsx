import React from "react";
import { NextPage } from "next";
import SubjectsList from "@/components/subjectDetails/SubjectsList/SubjectsList";
import ManagementLayout from "@/components/layout/ManagementLayout/ManagementLayout";

const SubjectsPage: NextPage = () => {
    return (
        <ManagementLayout>
            <SubjectsList />
        </ManagementLayout>
    );
};

export default SubjectsPage;
