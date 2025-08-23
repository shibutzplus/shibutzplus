import React from "react";
import { DAYS_OF_WORK_WEEK } from "@/utils/time";
import ReadOnlyHeader from "@/components/ui/table/ReadOnlyHeader/ReadOnlyHeader";

const AnnualHeader: React.FC = () => {
    return (
        <ReadOnlyHeader
            trs={DAYS_OF_WORK_WEEK}
            textPlaceholder={(text) => `יום ${text}׳`}
            hasHour
        />
    );
};

export default AnnualHeader;
