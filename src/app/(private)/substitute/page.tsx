import React from "react";
import { NextPage } from "next";
import SubstitutesList from "@/components/details/substituteDetails/SubstitutesList/SubstitutesList";
import ManagementLayout from "@/components/layout/ManagementLayout/ManagementLayout";

const SubstitutePage: NextPage = () => {
    return (
        <ManagementLayout>
            <SubstitutesList />
        </ManagementLayout>
    );
};

export default SubstitutePage;
