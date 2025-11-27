import React from "react";
import ReadOnlyHeader from "@/components/ui/table/ReadOnlyHeader/ReadOnlyHeader";
import { useMobileSize } from "@/hooks/browser/useMobileSize";

const TeacherHeader: React.FC = () => {
    const isMobile = useMobileSize();
    const trs = isMobile ? [""] : ["פרטים", "חומרי לימוד"];
    return (
        <ReadOnlyHeader
            trs={trs}
            emptyTrs={1}
            textPlaceholder={(text) => text}
            hasHour
        />
    );
};

export default TeacherHeader;
