import React from "react";
import Icons from "@/style/icons";
import routePath from "../routes";
import { USER_ROLES } from "@/models/constant/auth";

export interface ILink {
    name: string | React.ReactNode;
    p: string;
    Icon: React.ReactNode;
    isGuestBlocked?: boolean;
    action?: string;
    hasDivider?: boolean;
    shortcut?: string;
}

export interface ILinkGroup {
    id: string;
    title: string;
    links: ILink[];
    type: "private" | "public" | "substitute";
    isCollapse?: boolean;
    isFooter?: boolean;
    isOpenByDefault?: boolean;
}

export const NAV_LINK_GROUPS: ILinkGroup[] = [
    {
        id: "schedule",
        title: "מערכת שעות",
        type: "private",
        isCollapse: false,
        links: [
            {
                name: routePath.dailyBuild.menuTitle ?? routePath.dailyBuild.title,
                p: routePath.dailyBuild.p,
                Icon: <Icons.dailyCalendar size={24} />,
            },
        ],
    },

    {
        id: "built_schedule",
        title: "מערכת שנתית",
        type: "private",
        isCollapse: true,
        links: [
            {
                name: routePath.annualView.menuTitle ?? routePath.annualView.title,
                p: routePath.annualView.p,
                Icon: <Icons.calendar size={24} />,
                shortcut: "Ctrl+M",
            },
            {
                name: routePath.annualBuildByClass.menuTitle ?? routePath.annualBuildByClass.title,
                p: routePath.annualBuildByClass.p,
                Icon: <Icons.calendar size={24} />,
                isGuestBlocked: true,
            },
            {
                name: routePath.annualBuildByTeacher.menuTitle ?? routePath.annualBuildByTeacher.title,
                p: routePath.annualBuildByTeacher.p,
                Icon: <Icons.calendar size={24} />,
                isGuestBlocked: true,
            },
        ],
    },
    {
        id: "alt_schedule",
        title: "מערכת לזמן חירום",
        type: "private",
        isCollapse: true,
        links: [
            {
                name: routePath.annualAltBuild.menuTitle ?? routePath.annualAltBuild.title,
                p: routePath.annualAltBuild.p,
                Icon: <Icons.calendar size={24} />,
                isGuestBlocked: true,
            },
            {
                name: routePath.annualAltView.menuTitle ?? routePath.annualAltView.title,
                p: routePath.annualAltView.p,
                Icon: <Icons.calendar size={24} />,
                isGuestBlocked: true,
            },
        ],
    },
    {
        id: "statistics",
        title: "דוחות",
        type: "private",
        isCollapse: true,
        links: [
            {
                name: routePath.missingReport.menuTitle ?? routePath.missingReport.title,
                p: routePath.missingReport.p,
                Icon: <Icons.report size={24} />,
                isGuestBlocked: true,
            },
            {
                name: routePath.history.menuTitle ?? routePath.history.title,
                p: routePath.history.p,
                Icon: <Icons.history size={24} />,
                isGuestBlocked: true,
            },
            {
                name: routePath.statistics.menuTitle ?? routePath.statistics.title,
                p: routePath.statistics.p,
                Icon: <Icons.stats size={24} />,
                isGuestBlocked: true,
            },
        ],
    },

    {
        id: "school_settings",
        title: "ניהול משאבים",
        type: "private",
        isCollapse: true,
        links: [
            {
                name: routePath.teachers.menuTitle ?? routePath.teachers.title,
                p: routePath.teachers.p,
                Icon: <Icons.teacher size={22} />,
                isGuestBlocked: true,
            },
            {
                name: routePath.substitute.menuTitle ?? routePath.substitute.title,
                p: routePath.substitute.p,
                Icon: <Icons.substituteTeacher size={24} />,
                isGuestBlocked: true,
            },
            {
                name: routePath.staff.menuTitle ?? routePath.staff.title,
                p: routePath.staff.p,
                Icon: <Icons.staff size={24} />,
                isGuestBlocked: true,
            },
            {
                name: routePath.subjects.menuTitle ?? routePath.subjects.title,
                p: routePath.subjects.p,
                Icon: <Icons.book size={24} />,
                isGuestBlocked: true,
            },
            {
                name: routePath.classes.menuTitle ?? routePath.classes.title,
                p: routePath.classes.p,
                Icon: <Icons.chair size={24} />,
                isGuestBlocked: true,
            },
            {
                name: routePath.groups.menuTitle ?? routePath.groups.title,
                p: routePath.groups.p,
                Icon: <Icons.users size={24} />,
                isGuestBlocked: true,
            },
        ],
    },

    {
        id: USER_ROLES.ADMIN,
        title: "Admin",
        type: "private",
        isCollapse: true,
        links: [
            {
                name: routePath.signUp.menuTitle ?? routePath.signUp.title,
                p: routePath.signUp.p,
                Icon: <Icons.users size={24} />,
                isGuestBlocked: true,
            },
            {
                name: "ייבוא מערכת שנתית",
                p: "/annual-import",
                Icon: <Icons.upload size={24} />,
                isGuestBlocked: true,
            },
            {
                name: "ניקוי קאש",
                p: "#",
                action: "clear_cache",
                Icon: <Icons.refresh size={24} />,
                isGuestBlocked: true,
            },

        ],
    },
    {
        id: "teachers",
        title: "שינויים במערכת היומית",
        type: "public",
        isCollapse: true,
        isOpenByDefault: true,
        links: [
            {
                name: routePath.teacherChanges.menuTitle ?? routePath.teacherChanges.title,
                p: routePath.teacherChanges.p,
                Icon: <Icons.teacher size={22} />,
            },
            {
                name: routePath.schoolChanges.menuTitle ?? routePath.schoolChanges.title,
                p: routePath.schoolChanges.p,
                Icon: <Icons.calendar size={24} />,
            },
            {
                name: (
                    <div style={{ display: "flex", flexDirection: "column", lineHeight: "1.2" }}>
                        <span>{(routePath.schoolChangesFull.menuTitle ?? routePath.schoolChangesFull.title) as string}</span>
                        <span style={{ fontSize: "0.85em", paddingTop: "5px" }}>(מסך מלא)</span>
                    </div>
                ),
                p: routePath.schoolChangesFull.p,
                Icon: <Icons.tv size={24} />,
            },
        ],
    },
    {
        id: "emergency_schedule",
        title: "מערכת לזמן חירום",
        type: "public",
        isCollapse: true,
        isOpenByDefault: true,
        links: [
            {
                name: routePath.teacherChangesAlt.menuTitle ?? routePath.teacherChangesAlt.title,
                p: routePath.teacherChangesAlt.p,
                Icon: <Icons.teacher size={24} />,
            },
            {
                name: routePath.schoolChangesAlt.menuTitle ?? routePath.schoolChangesAlt.title,
                p: routePath.schoolChangesAlt.p,
                Icon: <Icons.calendar size={24} />,
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
                p: routePath.teacherChanges.p,
                Icon: <Icons.teacher size={24} />,
            },
        ],
    },
    {
        id: "account",
        title: "חשבון",
        type: "private",
        isCollapse: false,
        isFooter: true,
        links: [
            {
                name: "יציאה",
                p: "#",
                action: "logout",
                Icon: <Icons.logOut size={24} />,
            },
        ],
    },
    {
        id: "account_sub",
        title: "חשבון",
        type: "substitute",
        isCollapse: false,
        isFooter: true,
        links: [
            {
                name: "יציאה",
                p: "#",
                action: "logout",
                Icon: <Icons.logOut size={24} />,
            },
        ],
    },
    {
        id: "account_pub",
        title: "חשבון",
        type: "public",
        isCollapse: false,
        isFooter: true,
        links: [
            {
                name: "יציאה",
                p: "#",
                action: "logout",
                Icon: <Icons.logOut size={24} />,
            },
        ],
    },
];
