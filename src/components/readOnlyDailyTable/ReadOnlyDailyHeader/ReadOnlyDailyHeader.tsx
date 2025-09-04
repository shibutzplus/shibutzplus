import React from "react";
import ReadOnlyHeader from "@/components/ui/table/ReadOnlyHeader/ReadOnlyHeader";

type ReadOnlyDailyHeaderProps = {
    titles: string[];
};

const ReadOnlyDailyHeader: React.FC<ReadOnlyDailyHeaderProps> = ({ titles }) => {
    return (
        <ReadOnlyHeader
            trs={Array.from({ length: titles.length }, (_, i) => i + 1)}
            textPlaceholder={(i: unknown) => titles[(i as number) - 1]}
            hasHour
        />
    );
};

export default ReadOnlyDailyHeader;
