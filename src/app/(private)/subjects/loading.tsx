import React from "react";
import ListSkeleton from "@/components/loading/skeleton/ListSkeleton/ListSkeleton";

const Loading: React.FC = () => {
    return <ListSkeleton titles={["שם המקצוע", "פעולות"]} />;
};

export default Loading;
