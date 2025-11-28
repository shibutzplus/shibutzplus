import React from "react";
import ReadOnlyHeader from "@/components/ui/table/ReadOnlyHeader/ReadOnlyHeader";
import { useMobileSize } from "@/hooks/browser/useMobileSize";

type TeacherHeaderProps = {
    onlyMobile?: boolean;
    isInsidePanel?: boolean;
};

const TeacherHeader: React.FC<TeacherHeaderProps> = ({ onlyMobile = false, isInsidePanel = false }) => {
    const isMobile = useMobileSize();
    const trs = onlyMobile ? ["חומרי לימוד"] : isMobile ? ["חומרי לימוד"] : ["פרטים", "חומרי לימוד"];
    return (
        <ReadOnlyHeader
            trs={trs}
            emptyTrs={1}
            textPlaceholder={(text) => text}
            hasHour
            hasHeader={!onlyMobile}
            isInsidePanel={isInsidePanel}
        />
    );
};

export default TeacherHeader;
