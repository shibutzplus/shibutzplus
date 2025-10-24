import TopNavLayout from "@/components/layout/TopNavLayout/TopNavLayout";
import { getPageTitleFromUrl } from "@/utils/format";
import { usePathname } from "next/navigation";
import React, { useMemo } from "react";

const DetailsTopNav: React.FC = () => {
    const pathname = usePathname();

    const pageTitle = useMemo(() => {
        return getPageTitleFromUrl(pathname) || "";
    }, [pathname]);

    return (
        <TopNavLayout
            type="details"
            childrens={{ left: undefined, right: <div>{pageTitle}</div> }}
        />
    );
};

export default DetailsTopNav;
