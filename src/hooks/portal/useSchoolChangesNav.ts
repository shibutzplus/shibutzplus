import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePortalContext } from "@/context/PortalContext";
import { MAX_COLUMNS_FOR_FULL_SCREEN } from "@/models/constant/table";
import router from "@/routes";

export const useSchoolChangesNav = () => {
    const route = useRouter();
    const { mainPublishTable, selectedDate, hasFetched, fetchPublishScheduleData } = usePortalContext();
    const [isLoading, setIsLoading] = useState(false);

    const columnCount = Object.keys(mainPublishTable[selectedDate] || {}).length;

    const navigateToSchoolChanges = async () => {
        if (isLoading) return;
        
        let currentColumnCount = columnCount;

        if (!hasFetched) {
            setIsLoading(true);
            const response = await fetchPublishScheduleData();
            setIsLoading(false);
            
            if (response && response.data) {
                const uniqueColumns = new Set(response.data.map((item: any) => item.columnId));
                currentColumnCount = uniqueColumns.size;
            }
        }

        if (currentColumnCount > MAX_COLUMNS_FOR_FULL_SCREEN) {
            route.push(router.schoolChanges.p);
        } else {
            route.push(router.schoolChangesFull.p);
        }
    };

    return { navigateToSchoolChanges, isLoading };
};
