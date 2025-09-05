import React from "react";
import { NextPage } from "next";
import TeachersList from "@/components/teacherDetails/TeachersList/TeachersList";
import ManagementLayout from "@/components/layout/ManagementLayout/ManagementLayout";

const TeachersPage: NextPage = () => {
    return (
        <ManagementLayout>
            <TeachersList />
        </ManagementLayout>
    );
};

export default TeachersPage;
