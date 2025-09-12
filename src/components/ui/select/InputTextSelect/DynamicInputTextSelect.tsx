import dynamic from "next/dynamic";

const DynamicInputTextSelect = dynamic(() => import("./InputTextSelect"), {
    ssr: false,
    loading: () => (
        <div
            style={{
                minHeight: "42px",
                borderColor: "#ccc",
                borderRadius: "4px",
                borderWidth: "1px",
                borderStyle: "solid",
                fontSize: "16px",
                backgroundColor: "white",
                color: "#999",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                position: "relative",
                cursor: "default",
                opacity: 0.6,
            }}
        >
            {/* Value container with placeholder */}
            <div
                style={{
                    padding: "2px 8px",
                    fontSize: "16px",
                    color: "#999",
                    flex: 1,
                }}
            >
                בחר אופציה...
            </div>

            {/* Indicators container */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    height: "100%",
                }}
            >
                {/* Indicator separator */}
                <div
                    style={{
                        width: "1px",
                        height: "20px",
                        backgroundColor: "#ccc",
                        marginRight: "8px",
                    }}
                />

                {/* Dropdown indicator */}
                <div
                    style={{
                        padding: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <div
                        style={{
                            width: "0",
                            height: "0",
                            borderLeft: "4px solid transparent",
                            borderRight: "4px solid transparent",
                            borderTop: "4px solid #999",
                        }}
                    />
                </div>
            </div>
        </div>
    ),
});

export default DynamicInputTextSelect;
