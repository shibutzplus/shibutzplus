import React from "react";
import Icons from "@/style/icons";
import routePath from "../routes";

export interface ILink {
    name: string | React.ReactNode;
    p: string;
    Icon: React.ReactNode;
    isForGuest?: boolean;
}

export interface ILinkGroup {
    id: string;
    title: string;
    links: ILink[];
    type: "private" | "public" | "substitute";
    isCollapse?: boolean;
}

export const NAV_LINK_GROUPS: ILinkGroup[] = [
    {
        id: "schedule",
        title: "מערכת שעות",
        type: "private",
        isCollapse: false,
        links: [
            {
                name: routePath.dailySchedule.title,
                p: routePath.dailySchedule.p,
                Icon: <Icons.dailyCalendar size={24} />,
                isForGuest: true,
            },
            {
                name: routePath.annualView.title,
                p: routePath.annualView.p,
                Icon: <Icons.calendar size={24} />,
                isForGuest: true,
            },
            {
                name: routePath.history.title,
                p: routePath.history.p,
                Icon: <Icons.history size={24} />,
                isForGuest: false,
            },
            {
                name: routePath.statistics.title,
                p: routePath.statistics.p,
                Icon: <Icons.stats size={24} />,
                isForGuest: false,
            },
        ],
    },

    {
        id: "school_settings",
        title: "בית הספר",
        type: "private",
        isCollapse: true,
        links: [
            {
                name: routePath.teachers.title,
                p: routePath.teachers.p,
                Icon: <Icons.teacher size={24} />,
                isForGuest: false,
            },
            {
                name: routePath.substitute.title,
                p: routePath.substitute.p,
                Icon: <Icons.substituteTeacher size={24} />,
                isForGuest: false,
            },
            {
                name: routePath.subjects.title,
                p: routePath.subjects.p,
                Icon: <Icons.book size={24} />,
                isForGuest: false,
            },
            {
                name: routePath.classes.title,
                p: routePath.classes.p,
                Icon: <Icons.chair size={24} />,
                isForGuest: false,
            },
            {
                name: routePath.groups.title,
                p: routePath.groups.p,
                Icon: <Icons.users size={24} />,
                isForGuest: false,
            },
            {
                name: routePath.staff.title,
                p: routePath.staff.p,
                Icon: <Icons.teacherSolid size={24} />,
                isForGuest: false,
            },
        ],
    },
    {
        id: "built_schedule",
        title: "עדכון מערכת שנתית",
        type: "private",
        isCollapse: true,
        links: [
            {
                name: "לפי כיתה",
                p: routePath.annualByClass.p,
                Icon: <Icons.calendar size={24} />,
                isForGuest: false,
            },
            {
                name: "לפי מורה",
                p: routePath.annualByTeacher.p,
                Icon: <Icons.calendar size={24} />,
                isForGuest: false,
            },
        ],
    },
    {
        id: "admin",
        title: "Admin",
        type: "private",
        isCollapse: true,
        links: [
            {
                name: "הוספת מנהל",
                p: routePath.signUp.p,
                Icon: <Icons.users size={24} />,
                isForGuest: false,
            },
            {
                name: "ייבוא מערכת שנתית",
                p: "/annual-import",
                Icon: <Icons.upload size={24} />,
                isForGuest: false,
            },

        ],
    },
    {
        id: "teachers",
        title: "מסכים למורים",
        type: "public",
        isCollapse: false,
        links: [
            {
                name: "המערכת שלי",
                p: routePath.teacherMaterialPortal.p,
                Icon: <Icons.teacher size={22} />,
                isForGuest: false,
            },
            {
                name: "מערכת בית ספרית",
                p: routePath.scheduleViewPortal.p,
                Icon: <Icons.group size={24} />,
                isForGuest: false,
            },
            {
                name: (
                    <div style={{ display: "flex", flexDirection: "column", lineHeight: "1.2" }}>
                        <span>מערכת בית ספרית</span>
                        <span style={{ fontSize: "0.85em", paddingTop: "5px" }}>(מסך מלא)</span>
                    </div>
                ),
                p: routePath.fullScheduleView.p,
                Icon: <Icons.tv size={24} />,
            },
        ],
    },
    {
        id: "substitute",
        title: "מסכים למורי ממלאי מקום",
        type: "substitute",
        isCollapse: false,
        links: [
            {
                name: "המערכת שלי",
                p: routePath.teacherMaterialPortal.p,
                Icon: <Icons.teacher size={24} />,
                isForGuest: false,
            },
        ],
    },
];
