import React from "react";
import ListSkeleton from "@/components/layout/skeleton/ListSkeleton/ListSkeleton";

const Loading: React.FC = () => {
    return <ListSkeleton headThs={["שם המורה", "פעולות"]} hasAdditionalBtn />;
};

export default Loading;
