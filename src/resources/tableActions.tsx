import { ActionColumnType } from "@/models/types/table";
import React from "react";
import { FaHistory, FaPlus } from "react-icons/fa";

export const tableActions: {
    key?: ActionColumnType;
    Icon?: React.ReactNode;
    isDelete?: boolean;
    label: string;
    style: React.CSSProperties;
    disabled: boolean;
}[] = [
    {
        key: "publish",
        Icon: <FaPlus />,
        label: "פרסום",
        style: { borderLeft: "4px solid #2a2a2a" },
        disabled: true,
    },
    {
        key: "history",
        Icon: <FaHistory />,
        label: "היסטוריה",
        style: { borderLeft: "4px solid #2a2a2a" },
        disabled: true,
    },
    {
        key: "missingTeacher",
        Icon: <FaPlus />,
        label: "מורה חסר",
        style: { borderLeft: "4px solid #aeac27", color: "#aeac27" },
        disabled: false,
    },
    {
        key: "existingTeacher",
        Icon: <FaPlus />,
        label: "מורה קיים",
        style: { borderLeft: "4px solid #3498db", color: "#3498db" },
        disabled: false,
    },
    {
        key: "info",
        Icon: <FaPlus />,
        label: "מידע",
        style: { borderLeft: "4px solid #27ae60", color: "#27ae60" },
        disabled: false,
    },
];
