import dynamic from "next/dynamic";
import styles from "./InputSelect.module.css";

const DynamicInputSelect = dynamic(() => import("./InputSelect"), {
    ssr: false,
    loading: () => (
        <div
            className={styles.selectContainer}
            style={{
                background: "#fff",
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

export default DynamicInputSelect;
