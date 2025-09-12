import React from "react";
import ListSkeleton from "@/components/layout/skeleton/ListSkeleton/ListSkeleton";

const Loading: React.FC = () => {
    return <ListSkeleton headThs={["שם המקצוע", "פעולות"]} />;
};

export default Loading;
