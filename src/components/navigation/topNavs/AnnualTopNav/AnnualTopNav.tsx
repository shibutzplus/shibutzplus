import AnnualTopActions from "@/components/actions/AnnualTopActions/AnnualTopActions";
import TopNavLayout from "@/components/layout/TopNavLayout/TopNavLayout";
import { getPageTitleFromUrl } from "@/utils/format";
import { usePathname } from "next/navigation";
import React, { useMemo } from "react";

const AnnualTopNav: React.FC = () => {
    const pathname = usePathname();

    const pageTitle = useMemo(() => {
        return getPageTitleFromUrl(pathname) || "";
    }, [pathname]);

    return (
        <TopNavLayout
            type="annual"
            childrens={{
                left: undefined,
                right: (
                    <div>
                        {pageTitle} <AnnualTopActions />
                    </div>
                ),
            }}
        />
    );
};

export default AnnualTopNav;
