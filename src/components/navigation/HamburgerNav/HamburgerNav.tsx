"use client"

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import styles from "./HamburgerNav.module.css";
import { STATUS_AUTH } from "@/models/constant/session";
import Icons from "@/style/icons";
import { useAccessibility } from "../../../hooks/useAccessibility";
import routePath from "../../../routes";
import { clearStorage, getStorageTeacher } from "@/lib/localStorage";
import { clearSessionStorage } from "@/lib/sessionStorage";
import { NavType } from "@/models/types";

type HamburgerNavProps = {
    isOpen: boolean
    onClose: () => void
    hamburgerType: NavType;
}

interface ILink {
    name: string
    p: string
    Icon: React.ReactNode
    withDivider?: boolean
    withExternal?: boolean
}
const links: ILink[] = [
    {
        name: routePath.dailySchedule.title,
        p: routePath.dailySchedule.p,
        Icon: <Icons.dailyCalendar size={24} />,
        withExternal: false,
    },
    {
        name: routePath.history.title,
        p: routePath.history.p,
        Icon: <Icons.eye size={24} />,
        withDivider: true,
        withExternal: false,
    },
    {
        name: routePath.teachers.title,
        p: routePath.teachers.p,
        Icon: <Icons.teacher size={24} />,
        withExternal: false,
    },
    {
        name: routePath.substitute.title,
        p: routePath.substitute.p,
        Icon: <Icons.substituteTeacher size={24} />,
        withExternal: false,
    },
    {
        name: routePath.subjects.title,
        p: routePath.subjects.p,
        Icon: <Icons.book size={24} />,
        withExternal: false,
    },
    {
        name: routePath.classes.title,
        p: routePath.classes.p,
        Icon: <Icons.chair size={24} />,
        withDivider: true,
        withExternal: false,
    },
    {
        name: routePath.annualSchedule.title,
        p: routePath.annualSchedule.p,
        Icon: <Icons.calendar size={24} />,
        withExternal: false,
    },
]

type LinkComponentProps = {
    link: ILink
    onClose: () => void
    currentPath: string
}

const LinkComponent: React.FC<LinkComponentProps> = ({ link, onClose, currentPath }) => {
    const isActive = currentPath.startsWith(link.p)

    // Open link in a new tab without closing the menu
    const handleOpenNewTab = (e: React.MouseEvent) => {
        e.stopPropagation()
        e.preventDefault()
        window.open(link.p, "_blank", "noopener,noreferrer")
    }

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

            {link.withExternal && (
                <button
                    type="button"
                    className={styles.newTabBtn}
                    onClick={handleOpenNewTab}
                    aria-label={`Open ${link.name} in new tab`}
                    title="פתח בטאב חדש"
                >
                    <Icons.newWindow size={18} style={{ color: "#707070ff" }} />
                </button>
            )}
        </div>
    )
}

const HamburgerNav: React.FC<HamburgerNavProps> = ({ isOpen, onClose, hamburgerType = "private" }) => {
    const { status } = useSession()
    const pathname = usePathname()
    const navRef = useRef<HTMLDivElement>(null)
    const overlayRef = useRef<HTMLDivElement>(null)
    const route = useRouter()

    useAccessibility({ isOpen, navRef, onClose })

    useEffect(() => {
        if (!overlayRef.current) return
        if (!isOpen) overlayRef.current.setAttribute("inert", "")
        else overlayRef.current.removeAttribute("inert")
    }, [isOpen])

    const isPrivate = hamburgerType === "private"

    const handleLogout = () => {
        clearSessionStorage()
        if (isPrivate) {
            clearStorage()
            signOut({ callbackUrl: routePath.signIn.p })
        } else {
            // Read schoolId from teacher stored in localStorage
            const schoolId = getStorageTeacher()?.schoolId
            if (schoolId)
                route.push(`${routePath.teacherSignIn.p}/${schoolId}?auth=logout`)
            else
                route.push(`${routePath.teacherSignIn.p}?auth=logout`)
        }
        onClose()
    }

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

                {isPrivate ? (
                    <>
                        <section className={styles.menuSection}>
                            <ul>
                                {links.map((link, index) => (
                                    <li key={index} className={link.withDivider ? styles.withDivider : undefined}>
                                        <LinkComponent link={link} onClose={onClose} currentPath={pathname} />
                                    </li>
                                ))}
                            </ul>
                        </section>

                        {status === STATUS_AUTH ? (
                            <section className={styles.logoutSection}>
                                <div onClick={handleLogout} className={styles.navLink} aria-label="Logout">
                                    <Icons.logOut size={24} />
                                    <span>יציאה מהמערכת</span>
                                </div>
                            </section>
                        ) : null}
                    </>
                ) : (
                    <>
                        <section className={styles.supportSection}>
                            <p>צריכים עזרה או מענה לשאלה?</p>
                            <p>צרו איתנו קשר:</p>
                            <a href="mailto:shibutzplus@gmail.com">
                                shibutzplus@gmail.com
                            </a>
                        </section>
                        <section className={styles.logoutSection}>
                            <div onClick={handleLogout} className={styles.navLink} aria-label="Logout">
                                <Icons.logOut size={24} />
                                <span>יציאה מהמערכת</span>
                            </div>
                        </section>
                    </>
                )}
            </div>
        </div>
    )
}

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
    )
}

export default HamburgerNav
