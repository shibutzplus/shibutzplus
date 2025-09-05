import dynamic from "next/dynamic";
import styles from "./InputSelect.module.css";

const DynamicInputSelect = dynamic(() => import("./InputSelect"), {
    ssr: false,
    loading: () => (
        <div
            className={styles.selectContainer}
            style={{
                background: '#fff',
                // border: '1px solid #e0e0e0',
                // borderRadius: '4px',
                minHeight: '38px',
                boxShadow: 'none',
                padding: '4px 8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                width: '100%',
                opacity: 0.7,
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#aaa', fontSize: 15 }}>טוען...</span>
                {/* <span style={{ display: 'inline-block', width: 18, height: 18 }}>
                    <span style={{
                        display: 'block',
                        width: 18,
                        height: 18,
                        border: '3px solid #e0e0e0',
                        borderTop: '3px solid #aaa',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                    }} />
                </span> */}
            </div>
            {/* <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style> */}
        </div>
    ),
});

export default DynamicInputSelect;
