import React from "react";
import ReadOnlyHeader from "@/components/ui/table/ReadOnlyHeader/ReadOnlyHeader";

const PreviewTeacherHeader: React.FC = () => {
    return (
        <ReadOnlyHeader
            trs={[""]}
            emptyTrs={1}
            textPlaceholder={(text) => text}
            hasHour
        />
    );
};

export default PreviewTeacherHeader;
