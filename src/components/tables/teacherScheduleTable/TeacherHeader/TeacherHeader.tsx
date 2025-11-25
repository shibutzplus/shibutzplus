import React from "react";
import ReadOnlyHeader from "@/components/ui/table/ReadOnlyHeader/ReadOnlyHeader";

const TeacherHeader: React.FC = () => {
    return (
        <ReadOnlyHeader
            trs={["פרטים", "חומרי לימוד"]}
            emptyTrs={1}
            textPlaceholder={(text) => text}
            hasHour
        />
    );
};

export default TeacherHeader;
