import dynamic from "next/dynamic";
import LoadingSelectLayout from "../LoadingSelectLayout/LoadingSelectLayout";

const DynamicInputMultiSelect = dynamic(() => import("./InputMultiSelect"), {
    ssr: false,
    loading: () => <LoadingSelectLayout />,
});

export default DynamicInputMultiSelect;
