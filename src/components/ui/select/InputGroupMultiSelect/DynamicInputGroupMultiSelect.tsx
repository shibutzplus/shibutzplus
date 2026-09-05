import dynamic from "next/dynamic";
import LoadingSelectLayout from "../LoadingSelectLayout/LoadingSelectLayout";

// Currently unused across the system (kept as an infrastructure component)
const DynamicInputGroupMultiSelect = dynamic(() => import("./InputGroupMultiSelect"), {
    ssr: false,
    loading: () => <LoadingSelectLayout />,
});

export default DynamicInputGroupMultiSelect;
