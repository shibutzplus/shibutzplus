"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import styles from "./HamburgerNav.module.css";
import Icons from "@/style/icons";
import { motion, AnimatePresence } from "motion/react";
import { useAccessibility } from "../../../hooks/browser/useAccessibility";
import routePath from "../../../routes";
import { clearStorage, getStorageTeacher } from "@/lib/localStorage";
import { usePopup } from "@/context/PopupContext";
import SettingsPopup from "@/components/popups/SettingsPopup/SettingsPopup";
import { useOptionalMainContext } from "@/context/MainContext";
import { clearSessionStorage, getSessionStorage, SESSION_KEYS, setSessionStorage, } from "@/lib/sessionStorage";
import { AppType } from "@/models/types";
import { TeacherRoleValues, TeacherType } from "@/models/types/teachers";
import { DEFAULT_FROM_HOUR, DEFAULT_TO_HOUR } from "@/utils/time";
import { SchoolSettingsType } from "@/models/types/settings";
import useGuestModePopup from "@/hooks/useGuestModePopup";
import { NAV_LINK_GROUPS, ILink } from "@/resources/navigation";
import { USER_ROLES } from "@/models/constant/auth";
import usePWAInstall from "@/hooks/usePWAInstall";

type LinkComponentProps = {
    link: ILink;
    onClose: () => void;
    currentPath: string;
};

const LinkComponent: React.FC<LinkComponentProps> = ({ link, onClose, currentPath }) => {
    const isActive = currentPath.startsWith(link.p);
    const { data: session } = useSession();
    const userRole = (session?.user as any)?.role;
    const isGuest = userRole === USER_ROLES.GUEST;
    const guest = isGuest && !link.isForGuest;
    const { handleOpenGuestPopup } = useGuestModePopup();

    // Preserve ?schoolId for ADMIN users
    // This is important for debugging and testing as we loose schoolId when we navigate to a different page
    let finalHref = link.p;
    if (userRole === USER_ROLES.ADMIN && typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        const schoolIdParam = urlParams.get("schoolId");
        if (schoolIdParam) {
            finalHref = `${link.p}?schoolId=${encodeURIComponent(schoolIdParam)}`;
        }
    }

    return (
        <div className={styles.linkWrapper}>
            <Link
                href={guest ? "#" : finalHref}
                className={`${styles.navLink} ${isActive ? styles.active : ""}`}
                onClick={(e) => {
                    if (guest) {
                        e.preventDefault();
                        handleOpenGuestPopup();
                        return;
                    }
                    onClose();
                }}
            >
                {link.Icon}
                <span>{link.name}</span>
            </Link>
        </div>
    );
};
type HamburgerNavProps = {
    isOpen: boolean;
    onClose: () => void;
    hamburgerType: AppType;
    schoolSettings?: SchoolSettingsType;
    teacher?: TeacherType;
};

const HamburgerNav: React.FC<HamburgerNavProps> = ({
    isOpen,
    onClose,
    hamburgerType = "private",
    schoolSettings,
    teacher: teacherProp,
}) => {
    const pathname = usePathname();
    const navRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const route = useRouter();
    const { openPopup } = usePopup();
    const context = useOptionalMainContext();
    const school = context?.school;
    const { data: session } = useSession();
    const userRole = (session?.user as any)?.role;
    const [teacherState, setTeacherState] = React.useState<any>(null);
    const isGuest = userRole === USER_ROLES.GUEST;
    const { handleOpenGuestPopup } = useGuestModePopup();
    const teacher = teacherProp || teacherState;
    const { installPWA, isInstalled } = usePWAInstall();

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
            signOut({ callbackUrl: routePath.home.p });
        } else {
            // Read schoolId from teacher stored in localStorage
            const schoolId = teacher?.schoolId || getStorageTeacher()?.schoolId;
            if (schoolId) route.push(`${routePath.teacherSignIn.p}/${schoolId}?auth=logout`);
            else route.push(`${routePath.teacherSignIn.p}?auth=logout`);
        }
        onClose();
    };

    useEffect(() => {
        if (!teacherProp) {
            setTeacherState(getStorageTeacher());
        }
    }, [teacherProp]);

    const isSubstituteTeacher = teacher?.role === TeacherRoleValues.SUBSTITUTE;

    const displayedGroups = NAV_LINK_GROUPS
        .filter((group) => {
            if (group.id === "admin" && userRole !== USER_ROLES.ADMIN) return false;
            if (hamburgerType === "private") return group.type === "private";
            if (hamburgerType === "public") {
                if (isSubstituteTeacher) return group.type === "substitute";
                return group.type === "public";
            }
            return false;
        })
        .map((group) => {
            let links = group.links;
            // Inject "School Schedule" for substitute teachers if setting enabled
            if (
                group.type === "substitute" &&
                (schoolSettings?.displaySchedule2Susb || context?.settings?.displaySchedule2Susb)
            ) {
                const hasLink = links.some((l) => l.p === routePath.scheduleViewPortal.p);
                if (!hasLink) {
                    links = [
                        ...links,
                        {
                            name: "מערכת בית ספרית",
                            p: routePath.scheduleViewPortal.p,
                            Icon: <Icons.group size={24} />,
                        },
                    ];
                }
            }

            return {
                ...group,
                links: links.map((link) => {
                    if (link.p === routePath.teacherMaterialPortal.p) {
                        // Staff members & Substitutes -> Hide "My Schedule"
                        if (teacher?.role === TeacherRoleValues.STAFF) {
                            return null;
                        }
                        if (teacher) {
                            return {
                                ...link,
                                p: `${routePath.teacherMaterialPortal.p}/${teacher.schoolId}/${teacher.id}`,
                            };
                        }
                    }
                    return link;
                }).filter(Boolean) as ILink[],
            };
        });

    const [expandedGroups, setExpandedGroups] = React.useState<string[]>([]);

    useEffect(() => {
        const stored = getSessionStorage<string[]>(SESSION_KEYS.HAMBURGER_EXPANDED_GROUPS);
        if (stored) {
            setExpandedGroups(stored);
        }
    }, []);

    const toggleGroup = (title: string) => {
        setExpandedGroups((prev) => {
            const newState = prev.includes(title)
                ? prev.filter((t) => t !== title)
                : [...prev, title];
            setSessionStorage(SESSION_KEYS.HAMBURGER_EXPANDED_GROUPS, newState);
            return newState;
        });
    };

    const handleOpenSettings = () => {
        if (!school?.id) return;

        onClose();
        openPopup(
            "settings",
            "S",
            <SettingsPopup
                schoolId={school.id}
                initialFromHour={context?.settings?.fromHour ?? DEFAULT_FROM_HOUR}
                initialToHour={context?.settings?.toHour ?? DEFAULT_TO_HOUR}
                initialShowExternal={context?.settings?.displaySchedule2Susb || false}
                onSave={(newSettings) => {
                    context?.setSchool((prev) =>
                        prev
                            ? {
                                ...prev,
                                fromHour: newSettings.fromHour,
                                toHour: newSettings.toHour,
                                displaySchedule2Susb: newSettings.displaySchedule2Susb,
                            }
                            : prev,
                    );
                }}
            />,
        );
    };

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
                <div className={styles.navHeader}>
                    <div className={styles.headerActions}>
                        <button
                            className={styles.closeButton}
                            onClick={onClose}
                            aria-label="Close menu"
                        >
                            <Icons.close size={24} />
                        </button>
                    </div>
                </div>

                <div className={styles.menuContent}>
                    <section className={styles.menuSection}>
                        {displayedGroups.map((group, groupIndex) => {
                            const isCollapsible = group.isCollapse;
                            const isExpanded =
                                isCollapsible && group.title
                                    ? expandedGroups.includes(group.title)
                                    : true;

                            return (
                                <div key={groupIndex} className={styles.group}>
                                    {isCollapsible && group.title && (
                                        <div
                                            className={styles.groupHeader}
                                            onClick={() => toggleGroup(group.title!)}
                                        >
                                            <h3 className={styles.groupTitle}>{group.title}</h3>
                                            <motion.div
                                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                                transition={{ duration: 0.2 }}
                                                className={styles.groupArrow}
                                            >
                                                <Icons.arrowDown size={16} />
                                            </motion.div>
                                        </div>
                                    )}

                                    {isCollapsible ? (
                                        <AnimatePresence initial={false}>
                                            {isExpanded && (
                                                <motion.ul
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{
                                                        duration: 0.3,
                                                        ease: "easeInOut",
                                                    }}
                                                    style={{ overflow: "hidden" }}
                                                    className={styles.nestedList}
                                                >
                                                    {group.links.map((link, linkIndex) => (
                                                        <li key={linkIndex}>
                                                            <LinkComponent
                                                                link={link}
                                                                onClose={onClose}
                                                                currentPath={pathname}
                                                            />
                                                        </li>
                                                    ))}
                                                </motion.ul>
                                            )}
                                        </AnimatePresence>
                                    ) : (
                                        <ul>
                                            {group.links.map((link, linkIndex) => (
                                                <li key={linkIndex}>
                                                    <LinkComponent
                                                        link={link}
                                                        onClose={onClose}
                                                        currentPath={pathname}
                                                    />
                                                </li>
                                            ))}
                                        </ul>
                                    )}

                                    {groupIndex < displayedGroups.length - 1 && (
                                        <div className={styles.groupDivider} />
                                    )}
                                </div>
                            );
                        })}
                    </section>

                    <div className={styles.bottomSection}>
                        <section className={styles.logoutSection}>
                            {(Boolean(!isSubstituteTeacher) || Boolean(isPrivate)) && (
                                <>
                                    {!isInstalled && (
                                        <div className={styles.navLink} onClick={installPWA}>
                                            <div className={styles.mobileIcon}>
                                                <Icons.installMobile size={24} />
                                            </div>
                                            <div className={styles.desktopIcon}>
                                                <Icons.installDesktop size={24} />
                                            </div>
                                            <span>התקנה כאפליקציה</span>
                                        </div>
                                    )}

                                    {!isSubstituteTeacher && (
                                        <Link
                                            href={isPrivate ? routePath.faqManager.p : routePath.faqTeachers.p}
                                            className={styles.navLink}
                                            onClick={onClose}
                                            aria-label="שאלות נפוצות"
                                        >
                                            <Icons.faq size={24} />
                                            <span>שאלות נפוצות</span>
                                        </Link>
                                    )}
                                    {isPrivate && (
                                        <div
                                            className={styles.navLink}
                                            onClick={isGuest ? handleOpenGuestPopup : handleOpenSettings}
                                            aria-label="הגדרות מערכת"
                                        >
                                            <Icons.settings size={24} />
                                            <span>הגדרות מערכת</span>
                                        </div>
                                    )}
                                </>
                            )}
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
