"use client";

import React, { useState, useEffect, useMemo } from "react";
import { NextPage } from "next";
import { TeacherType } from "@/models/types/teachers";
import SubstitutesList from "@/components/substituteDetails/SubstitutesList/SubstitutesList";
import ManagementLayout from "@/components/layout/ManagementLayout/ManagementLayout";
import { useMainContext } from "@/context/MainContext";
import { getSubTeachersAction } from "@/app/actions/GET/getSubTeachersAction";
import { errorToast } from "@/lib/toast";
import messages from "@/resources/messages";

const SubstitutePage: NextPage = () => {
    const { school } = useMainContext();
    const [substitutes, setSubstitutes] = useState<TeacherType[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchSubstitutes = async () => {
            if (!school?.id) return;

            setIsLoading(true);
            try {
                const response = await getSubTeachersAction(school.id);
                if (response.success && response.data) {
                    setSubstitutes(response.data);
                } else {
                    errorToast(response.message || messages.teachers.error);
                }
            } catch (error) {
                console.error("Error fetching substitute teachers:", error);
                errorToast(messages.teachers.error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSubstitutes();
    }, [school]);

    const listInfo = useMemo(() => {
        return `${substitutes.length} מורים מחליפים`;
    }, [substitutes]);

    if (isLoading) {
        return <div>טוען מורים מחליפים...</div>;
    }

    return (
        <ManagementLayout
            formTitle=""
            listTitle="מורים מחליפים"
            listInfo={listInfo}
            children={[
                <SubstitutesList key="substitutes-list" substitutes={substitutes} />,
                <div key="empty-form"></div>,
            ]}
        />
    );
};

export default SubstitutePage;
