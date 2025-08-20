import React from "react";
import styles from "./PrivatePageLayout.module.css";
import TopNav from "@/components/navigation/TopNav/TopNav";

type PrivatePageLayoutProps = {
    CustomTopNav?: React.ReactNode;
    children: React.ReactNode;
};

const PrivatePageLayout = ({ CustomTopNav, children }: PrivatePageLayoutProps) => {
    return (
        <div className={styles.privatePageLayout} dir="rtl">
            {CustomTopNav ? CustomTopNav : <TopNav />}
            <main className={styles.contentMain}>{children}</main>
        </div>
    );
};

export default PrivatePageLayout;
