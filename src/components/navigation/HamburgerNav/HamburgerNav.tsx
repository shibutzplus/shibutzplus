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
};

interface ILink {
    name: string;
    p: string;
    Icon: React.ReactNode;
}

const links: ILink[] = [
    {
        name: routePath.dailySchedule.title,
        p: routePath.dailySchedule.p,
        Icon: <Icons.calendar size={24} />,
    },
    {
        name: routePath.annualSchedule.title,
        p: routePath.annualSchedule.p,
        Icon: <Icons.calendar size={24} />,
    },
    {
        name: routePath.substitute.title,
        p: routePath.substitute.p,
        Icon: <Icons.school size={24} />,
    },
    {
        name: routePath.teachers.title,
        p: routePath.teachers.p,
        Icon: <Icons.school size={24} />,
    },
    {
        name: routePath.subjects.title,
        p: routePath.subjects.p,
        Icon: <Icons.people size={24} />,
    },
    {
        name: routePath.classes.title,
        p: routePath.classes.p,
        Icon: <Icons.chair size={24} />,
    },
    {
        name: routePath.history.title,
        p: routePath.history.p,
        Icon: <Icons.history size={24} />,
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

const HamburgerNav: React.FC<HamburgerNavProps> = ({ isOpen, onClose }) => {
    const { data: session, status } = useSession();
    const navRef = useRef<HTMLDivElement>(null);
    useAccessibility({ isOpen, navRef, onClose });

    const overlayRef = useRef<HTMLDivElement>(null);
    React.useEffect(() => {
        if (overlayRef.current) {
            if (!isOpen) {
                overlayRef.current.setAttribute("inert", "");
            } else {
                overlayRef.current.removeAttribute("inert");
            }
        }
    }, [isOpen]);

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

                <section className={styles.menuSection}>
                    <ul>
                        {links.map((link, index) => (
                            <li key={index}>
                                <LinkComponent link={link} onClose={onClose} />
                            </li>
                        ))}
                    </ul>
                </section>

                {/* {session?.user && (
                    <section className={styles.userSection}>
                        <LinkComponent
                            link={{
                                name: routePath.profile.title,
                                p: routePath.profile.p,
                                Icon: <Icons.personCircle size={24} />,
                            }}
                            onClose={onClose}
                        />
                    </section>
                )} */}

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
                            <span>התנתקות</span>
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
