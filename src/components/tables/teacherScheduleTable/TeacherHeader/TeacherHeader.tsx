import React from "react";
import ReadOnlyHeader from "@/components/ui/table/ReadOnlyHeader/ReadOnlyHeader";

type TeacherHeaderProps = {
    onlyMobile?: boolean;
    isInsidePanel?: boolean;
};

const TeacherHeader: React.FC<TeacherHeaderProps> = ({ onlyMobile = false, isInsidePanel = false }) => {
    const trs = onlyMobile ? ["חומרי לימוד"] : ["כיתה", "חומרי לימוד"];
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
