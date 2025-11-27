import React from "react";
import ReadOnlyHeader from "@/components/ui/table/ReadOnlyHeader/ReadOnlyHeader";
import { useMobileSize } from "@/hooks/browser/useMobileSize";

type TeacherHeaderProps = {
    onlyMobile?: boolean;
};

const TeacherHeader: React.FC<TeacherHeaderProps> = ({ onlyMobile = false }) => {
    const isMobile = useMobileSize();
    const trs = onlyMobile ? [""] : isMobile ? [""] : ["פרטים", "חומרי לימוד"];
    return (
        <ReadOnlyHeader
            trs={trs}
            emptyTrs={1}
            textPlaceholder={(text) => text}
            hasHour
            hasHeader={!onlyMobile}
        />
    );
};

export default TeacherHeader;
