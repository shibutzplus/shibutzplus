import dynamic from "next/dynamic";
import LoadingSelectLayout from "../LoadingSelectLayout/LoadingSelectLayout";

const DynamicInputGroupSelect = dynamic(() => import("./InputGroupSelect"), {
    ssr: false,
    loading: () => <LoadingSelectLayout />,
});

export default DynamicInputGroupSelect;
