import React from "react";
import styles from "./MobileNavLayout.module.css";

type MobileNavLayoutProps = {
    children: React.ReactNode;
};

const MobileNavLayout = ({ children }: MobileNavLayoutProps) => {
    return <nav className={styles.mobileNav}>{children}</nav>;
};

export default MobileNavLayout;
