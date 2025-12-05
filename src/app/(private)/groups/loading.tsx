import ListSkeleton from "@/components/loading/skeleton/ListSkeleton/ListSkeleton";
import React from "react";

const Loading: React.FC = () => {
    return <ListSkeleton titles={["שם הקבוצה", "פעולות"]} />;
};

export default Loading;
