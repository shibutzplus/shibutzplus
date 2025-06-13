"use client";

import React from "react";
import styles from "./dashboard.module.css";
import { useSession } from "next-auth/react";
import { UserRole } from "../../../models/types/auth";
import { NextPage } from "next";

const DashboardPage: NextPage = () => {
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
            </div>
        </div>
    );
};

export default DashboardPage;
