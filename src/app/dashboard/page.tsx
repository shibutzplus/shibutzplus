"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./dashboard.module.css";
import { useSession, signOut } from "next-auth/react";
import { UserRole } from "../../models/types/auth";
import routePath from "../../routes";


const DashboardPage: React.FC = () => {
    const router = useRouter();

    // useSession to access the user data
    const { data: session, status } = useSession({
        required: true,
    });

    if (status === "loading") {
        return (
            <div className={styles.container}>
                <div className={styles.content}>
                    <h1>Loading...</h1>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <h1 className={styles.title}>Dashboard</h1>
                <div className={styles.userInfo}>
                    <h2>Welcome, {session?.user?.name}!</h2>
                    <p>Email: {session?.user?.email}</p>
                    <p>Role: {session?.user?.role as UserRole}</p>
                </div>
                <div className={styles.navigation}>
                    <Link href={routePath.connect.p} className={styles.navLink}>
                        Go to Connect Page
                    </Link>
                </div>
                <button
                    className={styles.logoutButton}
                    onClick={() => signOut({ redirect: true, callbackUrl: routePath.login.p })}
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default DashboardPage;
