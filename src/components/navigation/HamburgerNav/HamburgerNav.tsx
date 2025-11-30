"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import styles from "./HamburgerNav.module.css";
import { STATUS_AUTH } from "@/models/constant/session";
import Icons from "@/style/icons";
import { useAccessibility } from "../../../hooks/browser/useAccessibility";
import routePath from "../../../routes";
import { clearStorage, getStorageTeacher } from "@/lib/localStorage";
import { clearSessionStorage } from "@/lib/sessionStorage";
import { AppType } from "@/models/types";

type HamburgerNavProps = {
    isOpen: boolean;
    onClose: () => void;
    hamburgerType: AppType;
};

interface ILink {
    name: string;
    p: string;
    Icon: React.ReactNode;
    withDivider?: boolean;
}
const links: ILink[] = [
    {
        name: routePath.dailySchedule.title,
        p: routePath.dailySchedule.p,
        Icon: <Icons.dailyCalendar size={24} />,
    },
    {
        name: routePath.history.title,
        p: routePath.history.p,
        Icon: <Icons.history size={24} />,
        withDivider: true,
    },
    {
        name: routePath.teachers.title,
        p: routePath.teachers.p,
        Icon: <Icons.teacher size={24} />,
    },
    {
        name: routePath.substitute.title,
        p: routePath.substitute.p,
        Icon: <Icons.substituteTeacher size={24} />,
    },
    {
        name: routePath.subjects.title,
        p: routePath.subjects.p,
        Icon: <Icons.book size={24} />,
    },
    {
        name: routePath.classes.title,
        p: routePath.classes.p,
        Icon: <Icons.chair size={24} />,
    },
    {
        name: routePath.groups.title,
        p: routePath.groups.p,
        Icon: <Icons.users size={24} />,
        withDivider: true,
    },
    {
        name: routePath.annualByClass.title,
        p: routePath.annualByClass.p,
        Icon: <Icons.calendar size={24} />,
    },
    {
        name: routePath.annualByTeacher.title,
        p: routePath.annualByTeacher.p,
        Icon: <Icons.calendar size={24} />,
    },
];

type LinkComponentProps = {
    link: ILink;
    onClose: () => void;
    currentPath: string;
};

const LinkComponent: React.FC<LinkComponentProps> = ({ link, onClose, currentPath }) => {
    const isActive = currentPath.startsWith(link.p);

    return (
        <div className={styles.linkWrapper}>
            <Link
                href={link.p}
                className={`${styles.navLink} ${isActive ? styles.active : ""}`}
                onClick={onClose}
            >
                {link.Icon}
                <span>{link.name}</span>
            </Link>
        </div>
    );
};

const HamburgerNav: React.FC<HamburgerNavProps> = ({
    isOpen,
    onClose,
    hamburgerType = "private",
}) => {
    const { status } = useSession();
    const pathname = usePathname();
    const navRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const route = useRouter();

    useAccessibility({ isOpen, navRef, onClose });

    useEffect(() => {
        if (!overlayRef.current) return;
        if (!isOpen) overlayRef.current.setAttribute("inert", "");
        else overlayRef.current.removeAttribute("inert");
    }, [isOpen]);

    const isPrivate = hamburgerType === "private";

    const handleLogout = () => {
        clearSessionStorage();
        if (isPrivate) {
            clearStorage();
            signOut({ callbackUrl: routePath.signIn.p });
        } else {
            // Read schoolId from teacher stored in localStorage
            const schoolId = getStorageTeacher()?.schoolId;
            if (schoolId) route.push(`${routePath.teacherSignIn.p}/${schoolId}?auth=logout`);
            else route.push(`${routePath.teacherSignIn.p}?auth=logout`);
        }
        onClose();
    };

    const [teacherPortalPath, setTeacherPortalPath] = React.useState(routePath.teacherPortal.p);

    useEffect(() => {
        const teacher = getStorageTeacher();
        if (teacher) {
            setTeacherPortalPath(`${routePath.teacherPortal.p}/${teacher.schoolId}/${teacher.id}`);
        }
    }, []);

    const publicLinks: ILink[] = [
        {
            name: "המערכת שלי",
            p: teacherPortalPath,
            Icon: <Icons.teacher size={24} />,
        },
        {
            name: "מערכת בית ספרית",
            p: routePath.publishedPortal.p,
            Icon: <Icons.calendar size={24} />,
        },
    ];

    return (
        <div ref={overlayRef} className={`${styles.overlay} ${isOpen ? styles.open : ""}`}>
            <div
                ref={navRef}
                className={`${styles.nav} ${isOpen ? styles.open : ""}`}
                role="dialog"
                aria-modal="true"
                aria-label="Navigation menu"
                id="mobile-menu"
            >
                <button className={styles.closeButton} onClick={onClose} aria-label="Close menu">
                    <Icons.close size={24} />
                </button>

                <div className={styles.menuContent}>
                    <section className={styles.menuSection}>
                        <ul>
                            {(isPrivate ? links : publicLinks).map((link, index) => (
                                <li
                                    key={index}
                                    className={link.withDivider ? styles.withDivider : undefined}
                                >
                                    <LinkComponent
                                        link={link}
                                        onClose={onClose}
                                        currentPath={pathname}
                                    />
                                </li>
                            ))}
                        </ul>
                    </section>

                    <div className={styles.bottomSection}>
                        <section className={styles.menuSection}>
                            <Link
                                href={isPrivate ? "/faqManager" : "/faqTeachers"}
                                className={styles.navLink}
                                onClick={onClose}
                                aria-label="שאלות נפוצות"
                            >
                                <Icons.faq size={24} />
                                <span>שאלות נפוצות</span>
                            </Link>
                        </section>
                        <section className={styles.logoutSection}>
                            <div
                                onClick={handleLogout}
                                className={styles.navLink}
                                aria-label="Logout"
                            >
                                <Icons.logOut size={24} />
                                <span>יציאה מהמערכת</span>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const HamburgerButton: React.FC<{ onClick: () => void; isOpen: boolean }> = ({
    onClick,
    isOpen,
}) => {
    return (
        <button
            className={styles.hamburgerButton}
            onClick={onClick}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
        >
            <Icons.menu size={24} />
        </button>
    );
};

export default HamburgerNav;
