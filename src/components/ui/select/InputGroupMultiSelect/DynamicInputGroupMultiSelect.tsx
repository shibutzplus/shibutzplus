import dynamic from "next/dynamic";
import LoadingSelectLayout from "../LoadingSelectLayout/LoadingSelectLayout";

const DynamicInputGroupMultiSelect = dynamic(() => import("./InputGroupMultiSelect"), {
    ssr: false,
    loading: () => <LoadingSelectLayout />,
});

export default DynamicInputGroupMultiSelect;
