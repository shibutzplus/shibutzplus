"use client"

import React, { useRef, useEffect } from "react"
import styles from "./HamburgerNav.module.css"
import Link from "next/link"
import { signOut, useSession } from "next-auth/react"
import routePath from "../../../routes"
import { useAccessibility } from "../../../hooks/useAccessibility"
import { STATUS_AUTH } from "@/models/constant/session"
import Icons from "@/style/icons"
import { clearStorage, getStorageSchoolId } from "@/lib/localStorage"
import { clearSchoolCookie, clearTeacherCookie, getSchoolCookie } from "@/lib/cookies"
import { usePathname, useRouter } from "next/navigation"
import router from "../../../routes"
import { clearSessionStorage } from "@/lib/sessionStorage"

type HamburgerNavProps = {
    isOpen: boolean
    onClose: () => void
    variant?: "admin" | "portal"
}

interface ILink {
    name: string
    p: string
    Icon: React.ReactNode
    withDivider?: boolean
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
]

type LinkComponentProps = {
    link: ILink
    onClose: () => void
    currentPath: string
}

const LinkComponent: React.FC<LinkComponentProps> = ({ link, onClose, currentPath }) => {
    const isActive = currentPath.startsWith(link.p) // include sub routes
    return (
        <Link
            href={link.p}
            className={`${styles.navLink} ${isActive ? styles.active : ""}`}
            onClick={onClose}
        >
            {link.Icon}
            <span>{link.name}</span>
        </Link>
    )
}

const HamburgerNav: React.FC<HamburgerNavProps> = ({ isOpen, onClose, variant = "admin" }) => {
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

    const showAdminLinks = variant === "admin"

    const handleLogout = () => {
        if (variant === "admin") {
            clearStorage()
            signOut({ callbackUrl: routePath.signIn.p })
        } else {
            const schoolId = getSchoolCookie()
            clearSchoolCookie()
            clearTeacherCookie()
            clearSessionStorage()
            if (schoolId) route.push(`${router.teacherSignIn.p}/${schoolId}`)
            else route.push(`${router.teacherSignIn.p}`)
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
            >
                <button className={styles.closeButton} onClick={onClose} aria-label="Close menu">
                    <Icons.close size={24} />
                </button>

                {showAdminLinks ? (
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
                    <section className={`${styles.logoutSection} ${styles.noDivider}`}>
                        <div onClick={handleLogout} className={styles.navLink} aria-label="Logout">
                            <Icons.logOut size={24} />
                            <span>יציאה מהמערכת</span>
                        </div>
                    </section>
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
