import React from "react";
import styles from "./SideNav.module.css";
import Logo from "../../core/Logo/Logo";
import Link from "next/link";
import { signOut } from "next-auth/react";
import routePath from "../../../routes";
import {
    IoHomeOutline,
    IoCalendarOutline,
    IoSettingsOutline,
    IoPersonCircleOutline,
    IoLogOutOutline,
    IoSchoolOutline,
    IoPeopleOutline,
} from "react-icons/io5";
import { useSession } from "next-auth/react";

const SideNav: React.FC = () => {
    const { data: session, status } = useSession({
        required: true,
    });

    return (
        <nav className={styles.sideNav}>
            {/* Logo Section */}
            <section className={styles.logoSection}>
                <Logo size="S" />
            </section>

            {/* Main Links Section */}
            <section className={styles.menuSection}>
                <ul>
                    <li>
                        <Link href={routePath.dashboard.p} className={styles.navLink}>
                            <IoHomeOutline className={styles.icon} />
                            <span>לוח בקרה</span>
                        </Link>
                    </li>
                    <li>
                        <Link href={routePath.schedule.p} className={styles.navLink}>
                            <IoCalendarOutline className={styles.icon} />
                            <span>מערכת שעות</span>
                        </Link>
                    </li>
                    <li>
                        <Link href={routePath.teachers.p} className={styles.navLink}>
                            <IoPeopleOutline className={styles.icon} />
                            <span>מורים</span>
                        </Link>
                    </li>
                    <li>
                        <Link href={routePath.settings.p} className={styles.navLink}>
                            <IoSettingsOutline className={styles.icon} />
                            <span>הגדרות</span>
                        </Link>
                    </li>
                </ul>
            </section>

            {/* User Section */}
            <section className={styles.userSection}>
                <div className={styles.userProfile}>
                    <IoPersonCircleOutline className={styles.userIcon} />
                    <span>{session?.user?.name}</span>
                </div>
            </section>
            
            {/* Logout Section */}
            {status === "authenticated" && (
                <section className={styles.logoutSection}>
                    <button
                        onClick={() => signOut({ callbackUrl: routePath.signIn.p })}
                        className={styles.navLink}
                    >
                        <IoLogOutOutline className={styles.icon} />
                        <span>להתנתקות</span>
                    </button>
                </section>
            )}
        </nav>
    );
};

export default SideNav;
