import React from "react";
import Link from "next/link";
import styles from "./about.module.css";
import routePath from "@/models/routes";

const AboutPage: React.FC = () => {
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <h1 className={styles.title}>About ShibutzPlus</h1>
                <div className={styles.navigation}>
                    <Link href={routePath.home} className={styles.link}>
                        Home
                    </Link>
                    <Link href={routePath.login} className={styles.link}>
                        Login
                    </Link>
                    <Link href={routePath.register} className={styles.link}>
                        Register
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;
