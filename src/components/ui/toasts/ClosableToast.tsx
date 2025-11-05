"use client"

import React from "react"
import { toast, Toast } from "react-hot-toast"

type ClosableToastProps = {
    t: Toast
    message: string
    variant?: "default" | "error"
}

export const ClosableToast: React.FC<ClosableToastProps> = ({ t, message, variant = "default" }) => {
    const isError = variant === "error"

    return (
        <div
            style={{
                position: "relative",
                paddingTop: "25px",
            }}
        >
            <button
                onClick={() => toast.dismiss(t.id)}
                style={{
                    position: "absolute",
                    top: 0,
                    left: 8,
                    border: "none",
                    background: "transparent",
                    fontWeight: "bold",
                    fontSize: "20px",
                    lineHeight: 1,
                    color: isError ? "#7f1d1d" : "#666",
                    cursor: "pointer",
                }}
                aria-label="Close"
            >
                ×
            </button>
            <div>{message}</div>
        </div>
    )
}
