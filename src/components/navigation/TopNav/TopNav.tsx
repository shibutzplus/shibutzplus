import React from "react";
import styles from "./TopNav.module.css";
import Link from "next/link";
import routePath from "../../../routes";
import { signOut, useSession } from "next-auth/react";

const TopNav: React.FC = () => {
    const { status } = useSession();
    
    return (
        <header className={styles.contentHeader}>
            <nav className={styles.contentNav}>
                <div className={styles.navLogo}>
                    <Link href={routePath.dashboard.p}>שיבוץ +</Link>
                </div>
                <div className={styles.navLinks}>
                    <Link href={routePath.dashboard.p} className={styles.navLink}>
                        ראשי
                    </Link>
                    <Link href={routePath.teachers.p} className={styles.navLink}>
                        מורים
                    </Link>
                    {status === "authenticated" && (
                        <button 
                            onClick={() => signOut({ callbackUrl: routePath.signIn.p })}
                            className={styles.logoutButton}
                        >
                            התנתקות
                        </button>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default TopNav;
