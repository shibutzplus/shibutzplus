"use client";

import React, { useRef } from "react";
import styles from "./HamburgerNav.module.css";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import routePath from "../../../routes";
import { useAccessibility } from "../../../hooks/useAccessibility";
import { clearStorage } from "@/utils/localStorage";
import { STATUS_AUTH } from "@/models/constant/session";
import Icons from "@/style/icons";

type HamburgerNavProps = {
    isOpen: boolean;
    onClose: () => void;
    variant?: "admin" | "portal";
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
        withDivider: true,
    },
    {
        name: routePath.substitute.title,
        p: routePath.substitute.p,
        Icon: <Icons.substituteTeacher size={24} />,
    },
    {
        name: routePath.teachers.title,
        p: routePath.teachers.p,
        Icon: <Icons.teacher size={24} />,
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
        withDivider: true,
    },
    {
        name: routePath.history.title,
        p: routePath.history.p,
        Icon: <Icons.history size={24} />,
    },
    {
        name: routePath.annualSchedule.title,
        p: routePath.annualSchedule.p,
        Icon: <Icons.calendar size={24} />,
    },
];

const LinkComponent = ({ link, onClose }: { link: ILink; onClose: () => void }) => {
    return (
        <Link href={link.p} className={styles.navLink} onClick={onClose}>
            {link.Icon}
            <span>{link.name}</span>
        </Link>
    );
};

const HamburgerNav: React.FC<HamburgerNavProps> = ({
    isOpen,
    onClose,
    variant = "admin",
}) => {
    const { data: session, status } = useSession();
    const navRef = useRef<HTMLDivElement>(null);
    useAccessibility({ isOpen, navRef, onClose });

    const overlayRef = useRef<HTMLDivElement>(null);
    React.useEffect(() => {
        if (!overlayRef.current) return;
        if (!isOpen) overlayRef.current.setAttribute("inert", "");
        else overlayRef.current.removeAttribute("inert");
    }, [isOpen]);

    const showAdminLinks = variant === "admin";

    return (
        <div ref={overlayRef} className={`${styles.overlay} ${isOpen ? styles.open : ""}`}>
            <div
                ref={navRef}
                className={`${styles.nav} ${isOpen ? styles.open : ""}`}
                role="dialog"
                aria-modal="true"
                aria-label="Navigation menu"
            >
                <button className={styles.closeButton} onClick={onClose} aria-label="Close menu">
                    <Icons.close size={24} />
                </button>

                {showAdminLinks && (
                    <section className={styles.menuSection}>
                        <ul>
                            {links.map((link, index) => (
                                <li
                                    key={index}
                                    className={link.withDivider ? styles.withDivider : undefined}
                                >
                                    <LinkComponent link={link} onClose={onClose} />
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {status === STATUS_AUTH && (
                    <section className={styles.logoutSection}>
                        <Link
                            href="#"
                            onClick={() => {
                                onClose();
                                clearStorage();
                                signOut({ callbackUrl: routePath.signIn.p });
                            }}
                            className={styles.navLink}
                            aria-label="Logout"
                        >
                            <Icons.logOut size={24} />
                            <span>יציאה מהמערכת</span>
                        </Link>
                    </section>
                )}
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
