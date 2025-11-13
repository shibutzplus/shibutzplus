import TopNavLayout from "@/components/layout/TopNavLayout/TopNavLayout";
import React from "react";
import styles from "./DetailsTopNav.module.css";
//NOT IN USE
type DetailsTopNavProps = {
    pageTitle: string;
};

const DetailsTopNav: React.FC<DetailsTopNavProps> = ({ pageTitle }) => {
    return (
        <TopNavLayout
            type="private"
            elements={{
                topRight: <div className={styles.rightContainer}>{pageTitle}</div>,
            }}
        />
    );
};

export default DetailsTopNav;
