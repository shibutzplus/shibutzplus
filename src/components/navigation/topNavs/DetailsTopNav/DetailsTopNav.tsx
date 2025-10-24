import TopNavLayout from "@/components/layout/TopNavLayout/TopNavLayout";
import React from "react";
import styles from "./DetailsTopNav.module.css";

type DetailsTopNavProps = {
    pageTitle: string;
};

const DetailsTopNav: React.FC<DetailsTopNavProps> = ({ pageTitle }) => {
    return (
        <TopNavLayout
            type="details"
            childrens={{
                left: undefined,
                right: <div className={styles.rightContainer}>{pageTitle}</div>,
            }}
        />
    );
};

export default DetailsTopNav;
