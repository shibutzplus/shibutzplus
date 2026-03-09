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
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { successToast, errorToast } from "@/lib/toast";
import { clearSchoolCacheAction } from "@/app/actions/POST/clearSchoolCacheAction";

type LinkComponentProps = {
    link: ILink;
    onClose: () => void;
    currentPath: string;
    onAction?: (action: string) => void;
    isGuestUser?: boolean;
};

const LinkComponent: React.FC<LinkComponentProps> = ({ link, onClose, currentPath, onAction, isGuestUser }) => {
    const isActive = currentPath === link.p || currentPath.startsWith(link.p + "/") || currentPath.startsWith(link.p + "?");
    const { data: session } = useSession();
    const userRole = (session?.user as any)?.role;
    const shouldShowGuestPopup = isGuestUser && link.isGuestBlocked;
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
                href={shouldShowGuestPopup ? "#" : finalHref}
                className={`${styles.navLink} ${isActive ? styles.active : ""}`}
                onClick={async (e) => {
                    if (shouldShowGuestPopup) {
                        e.preventDefault();
                        handleOpenGuestPopup();
                        return;
                    }
                    if (link.action && onAction) {
                        e.preventDefault();
                        onClose();
                        onAction(link.action);
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
    const isGuestUser = userRole === USER_ROLES.GUEST;
    const { handleOpenGuestPopup } = useGuestModePopup();
    const teacher = teacherProp || teacherState;
    const { installPWA, isInstalled } = usePWAInstall();
    const { subscribeToPushNotification, permission, showIcon } = usePushNotifications();

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

            if (group.id === "alt_schedule") {
                const isAltScheduleEnabled = schoolSettings?.displayAltSchedule || context?.settings?.displayAltSchedule;
                if (!isAltScheduleEnabled) return false;
            }

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
                const hasLink = links.some((l) => l.p === routePath.schoolChanges.p);
                if (!hasLink) {
                    links = [
                        ...links,
                        {
                            name: "מערכת בית ספרית",
                            p: routePath.schoolChanges.p,
                            Icon: <Icons.group size={24} />,
                        },
                    ];
                }
            }

            return {
                ...group,
                links: links.map((link) => {
                    if (link.p === routePath.teacherChanges.p) {
                        // Staff members & Substitutes -> Hide "My Schedule"
                        if (teacher?.role === TeacherRoleValues.STAFF) {
                            return null;
                        }
                        if (teacher) {
                            return {
                                ...link,
                                p: `${routePath.teacherChanges.p}/${teacher.schoolId}/${teacher.id}`,
                            };
                        }
                    }
                    if (link.p === routePath.teacherChangesAlt.p) {
                        // Only regular teachers see the emergency alternative schedule
                        // And only if the 'displayAltSchedule'
                        const isAltScheduleEnabled = schoolSettings?.displayAltSchedule || context?.settings?.displayAltSchedule;

                        if (isAltScheduleEnabled && teacher && teacher.role === TeacherRoleValues.REGULAR) {
                            return {
                                ...link,
                                p: `${routePath.teacherChangesAlt.p}/${teacher.schoolId}/${teacher.id}`,
                            };
                        }

                        return null;
                    }
                    if (link.p === routePath.schoolChangesAlt.p) {
                        const isAltScheduleEnabled = schoolSettings?.displayAltSchedule || context?.settings?.displayAltSchedule;

                        if (isAltScheduleEnabled && teacher) {
                            return {
                                ...link,
                                p: `${routePath.schoolChangesAlt.p}`,
                            };
                        }

                        return null;
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
        } else {
            // Initialize with groups that should be open by default
            const defaultExpanded = NAV_LINK_GROUPS
                .filter(group => group.isOpenByDefault && group.id)
                .map(group => group.id);
            if (defaultExpanded.length > 0) {
                setExpandedGroups(defaultExpanded);
            }
        }
    }, []);

    const toggleGroup = (id: string) => {
        setExpandedGroups((prev) => {
            const newState = prev.includes(id)
                ? prev.filter((t) => t !== id)
                : [...prev, id];
            setSessionStorage(SESSION_KEYS.HAMBURGER_EXPANDED_GROUPS, newState);
            return newState;
        });
    };

    const handleAction = async (action: string) => {
        if (action === "clear_cache") {
            if (!school?.id) return;
            const res = await clearSchoolCacheAction(school.id);
            if (res.success) {
                successToast(res.message || "המטמון נוקה בהצלחה");
            } else {
                errorToast(res.message || "שגיאה בניקוי המטמון");
            }
        }
        if (action === "logout") {
            handleLogout();
        }
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
                initialDisplayAltSchedule={context?.settings?.displayAltSchedule || false}
                onSave={(newSettings) => {
                    context?.setSchool((prev) =>
                        prev
                            ? {
                                ...prev,
                                fromHour: newSettings.fromHour,
                                toHour: newSettings.toHour,
                                displaySchedule2Susb: newSettings.displaySchedule2Susb,
                                displayAltSchedule: newSettings.displayAltSchedule,
                            }
                            : prev,
                    );
                }}
            />,
        );
    };

    const allGroups = displayedGroups;
    const mainGroups = allGroups.filter((g) => !g.isFooter);
    const footerGroups = allGroups.filter((g) => g.isFooter);

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
                        {mainGroups.map((group, groupIndex) => {
                            const isCollapsible = group.isCollapse;
                            const isExpanded =
                                isCollapsible && group.id
                                    ? expandedGroups.includes(group.id)
                                    : true;

                            return (
                                <div key={groupIndex} className={styles.group}>
                                    {isCollapsible && group.title && (
                                        <div
                                            className={styles.groupHeader}
                                            onClick={() => toggleGroup(group.id)}
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
                                                        <React.Fragment key={linkIndex}>
                                                            {link.hasDivider && <div className={styles.groupDivider} />}
                                                            <li>
                                                                <LinkComponent
                                                                    link={link}
                                                                    onClose={onClose}
                                                                    currentPath={pathname}
                                                                    onAction={handleAction}
                                                                    isGuestUser={isPrivate && isGuestUser}
                                                                />
                                                            </li>
                                                        </React.Fragment>
                                                    ))}
                                                </motion.ul>
                                            )}
                                        </AnimatePresence>
                                    ) : (
                                        <ul>
                                            {group.links.map((link, linkIndex) => (
                                                <React.Fragment key={linkIndex}>
                                                    {link.hasDivider && <div className={styles.groupDivider} />}
                                                    <li>
                                                        <LinkComponent
                                                            link={link}
                                                            onClose={onClose}
                                                            currentPath={pathname}
                                                            onAction={handleAction}
                                                            isGuestUser={isPrivate && isGuestUser}
                                                        />
                                                    </li>
                                                </React.Fragment>
                                            ))}
                                        </ul>
                                    )}

                                    {groupIndex < mainGroups.length - 1 && (
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

                                    {!isPrivate && showIcon && permission === "default" && teacher?.schoolId && (
                                        <div
                                            className={styles.navLink}
                                            onClick={async () => {
                                                onClose();
                                                try {
                                                    await subscribeToPushNotification(teacher.schoolId!, teacher.id, true);
                                                } catch (e: any) {
                                                    if (e.message === "AntivirusBlocking") {
                                                        errorToast("נראה שתוכנת הגנה חוסמת את האפשרות להתראות מערכת 🤷.");
                                                    }
                                                }
                                            }}
                                        >
                                            <Icons.bell size={24} className={styles.bellIcon} />
                                            <span>עדכוני מערכת בזמן אמת</span>
                                        </div>
                                    )}

                                    {isPrivate && (
                                        <div
                                            className={styles.navLink}
                                            onClick={isGuestUser ? handleOpenGuestPopup : handleOpenSettings}
                                            aria-label="הגדרות שיבוץ+"
                                        >
                                            <Icons.settings size={24} />
                                            <span>הגדרות שיבוץ+</span>
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
                                </>
                            )}

                            {/* Render footer groups (e.g. Logout) */}
                            {footerGroups.map((group, groupIndex) => (
                                <React.Fragment key={`footer-${groupIndex}`}>
                                    {group.links.map((link, linkIndex) => (
                                        <LinkComponent
                                            key={`footer-link-${linkIndex}`}
                                            link={link}
                                            onClose={onClose}
                                            currentPath={pathname}
                                            onAction={handleAction}
                                            isGuestUser={isPrivate && isGuestUser}
                                        />
                                    ))}
                                </React.Fragment>
                            ))}
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
