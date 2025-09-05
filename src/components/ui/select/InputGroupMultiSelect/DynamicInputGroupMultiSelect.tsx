import dynamic from "next/dynamic";
import styles from "./InputGroupMultiSelect.module.css";

const DynamicInputGroupMultiSelect = dynamic(() => import("./InputGroupMultiSelect"), {
    ssr: false,
    loading: () => (
        <div
            className={styles.selectContainer}
            style={{
                background: "#fff",
                // border: "1px solid #e0e0e0",
                // borderRadius: "4px",
                minHeight: "38px",
                boxShadow: "none",
                padding: "4px 8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                width: "100%",
                opacity: 0.7,
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "#aaa", fontSize: 15 }}>טוען...</span>
            </div>
        </div>
    ),
});

export default DynamicInputGroupMultiSelect;
