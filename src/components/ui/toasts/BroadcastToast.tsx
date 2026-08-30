"use client"

import React from "react"
import { toast, Toast } from "react-hot-toast"

type BroadcastToastProps = {
    t: Toast
    message: string
    senderName?: string
}

export const BroadcastToast: React.FC<BroadcastToastProps> = ({ t, message, senderName }) => {
    return (
        <div
            style={{
                position: "relative",
                paddingTop: "28px",
                paddingBottom: "20px",
                direction: "rtl",
            }}
        >
            <button
                onClick={() => toast.dismiss(t.id)}
                style={{
                    position: "fixed",
                    top: 15,
                    left: 15,
                    border: "none",
                    background: "transparent",
                    fontWeight: "bold",
                    fontSize: "20px",
                    lineHeight: 1,
                    color: "#666",
                    cursor: "pointer",
                }}
                aria-label="Close"
            >
                ×
            </button>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontWeight: "700",
                    fontSize: "15.5px",
                    color: "#6b46c1",
                    marginBottom: "8px",
                }}
            >
                <span>{`הודעה מאת ${senderName || "שיבוץ פלוס"}`}</span>
            </div>
            <div style={{ whiteSpace: "pre-wrap", fontSize: "15px", lineHeight: "1.55", color: "#1f2937" }}>
                {message}
            </div>
        </div>
    )
}
