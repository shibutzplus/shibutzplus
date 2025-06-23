"use client";

import React, { useState, useMemo } from "react";
import { NextPage } from "next";
import { Profession } from "@/models/types/professions";
import ProfessionsForm from "@/components/ProfessionsForm/ProfessionsForm";
import ProfessionsList from "@/components/ProfessionsList/ProfessionsList";
import ManagementLayout from "@/components/layout/ManagementLayout/ManagementLayout";

// Sample data
const initialSubjects: Profession[] = [
    {
        id: "1",
        name: "מתמטיקה",
    },
    {
        id: "2",
        name: "אנגלית",
    },
    {
        id: "3",
        name: "עברית",
    },
    {
        id: "4",
        name: "היסטוריה",
    },
    {
        id: "5",
        name: "מדעים",
    },
    {
        id: "6",
        name: "ספרות",
    },
];

const SubjectsPage: NextPage = () => {
    const [professions, setProfessions] = useState<Profession[]>(initialSubjects);
    const [selectedProfession, setSelectedProfession] = useState<Profession | null>(null);

    const handleSelectProfession = (profession: Profession) => {
        setSelectedProfession(profession);
    };

    const listInfo = useMemo(() => {
        return `${professions.length} מקצועות`;
    }, [professions]);

    return (
        <ManagementLayout
            formTitle="הוספת מקצוע"
            listTitle="רשימת מקצועות"
            listInfo={listInfo}
            children={[
                <ProfessionsList professions={professions} handleSelectProfession={handleSelectProfession} />,
                <ProfessionsForm setProfessions={setProfessions} selectedProfession={selectedProfession} />,
            ]}
        />
    );
};

export default SubjectsPage;
