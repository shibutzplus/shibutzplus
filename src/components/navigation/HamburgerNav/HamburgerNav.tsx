import React, { useRef } from "react";
import styles from "./HamburgerNav.module.css";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import routePath from "../../../routes";
import { useAccessibility } from "../../../hooks/useAccessibility";
import { PiChairLight } from "react-icons/pi";
import {
    IoHomeOutline,
    IoCalendarOutline,
    IoPersonCircleOutline,
    IoLogOutOutline,
    IoSchoolOutline,
    IoPeopleOutline,
    IoMenuOutline,
    IoCloseOutline,
    IoMailOutline,
} from "react-icons/io5";

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
        name: routePath.dashboard.title,
        p: routePath.dashboard.p,
        Icon: <IoHomeOutline size={24} />,
    },
    {
        name: routePath.annualSystem.title,
        p: routePath.annualSystem.p,
        Icon: <IoCalendarOutline size={24} />,
    },
    {
        name: routePath.teachers.title,
        p: routePath.teachers.p,
        Icon: <IoSchoolOutline size={24} />,
    },
    {
        name: routePath.professions.title,
        p: routePath.professions.p,
        Icon: <IoPeopleOutline size={24} />,
    },
    {
        name: routePath.classes.title,
        p: routePath.classes.p,
        Icon: <PiChairLight size={24} />,
    },
    {
        name: routePath.connect.title,
        p: routePath.connect.p,
        Icon: <IoMailOutline size={24} />,
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

    return (
        <div className={`${styles.overlay} ${isOpen ? styles.open : ""}`} aria-hidden={!isOpen}>
            <div
                ref={navRef}
                className={`${styles.nav} ${isOpen ? styles.open : ""}`}
                role="dialog"
                aria-modal="true"
                aria-label="Navigation menu"
            >
                <button className={styles.closeButton} onClick={onClose} aria-label="Close menu">
                    <IoCloseOutline size={24} />
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

                {session?.user && (
                    <section className={styles.userSection}>
                        <LinkComponent
                            link={{
                                name: routePath.profile.title,
                                p: routePath.profile.p,
                                Icon: <IoPersonCircleOutline size={24} />,
                            }}
                            onClose={onClose}
                        />
                    </section>
                )}

                {status === "authenticated" && (
                    <section className={styles.logoutSection}>
                        <Link
                            href="#"
                            onClick={() => {
                                onClose();
                                signOut({ callbackUrl: routePath.signIn.p });
                            }}
                            className={styles.navLink}
                            aria-label="Logout"
                        >
                            <IoLogOutOutline size={24} />
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
            <IoMenuOutline size={24} />
        </button>
    );
};

export default HamburgerNav;
