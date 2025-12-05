import dynamic from "next/dynamic";
import LoadingSelectLayout from "../LoadingSelectLayout/LoadingSelectLayout";

// Used in: Sign-Up, Teachers Sign-In, TopActions (Annual, Daily, Teacher Portal), Annual Schedule Cell, Daily Schedule Header
const DynamicInputSelect = dynamic(() => import("./InputSelect"), {
    ssr: false,
    loading: () => <LoadingSelectLayout />,
});

export default DynamicInputSelect;
