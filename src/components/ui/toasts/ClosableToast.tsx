"use client"

import React, { useEffect, useRef } from "react"
import { toast, Toast } from "react-hot-toast"
import { formatBoldText } from "@/utils/formatBoldText"

type ClosableToastProps = {
    t: Toast
    message: string
    variant?: "default" | "error"
}

export const ClosableToast: React.FC<ClosableToastProps> = ({ t, message, variant = "default" }) => {
    const isError = variant === "error"
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handlePointerDown = (e: PointerEvent) => {
            const toastNode = containerRef.current?.parentElement || containerRef.current
            if (toastNode && !toastNode.contains(e.target as Node)) {
                toast.dismiss(t.id)
            }
        }

        const timer = setTimeout(() => {
            document.addEventListener("pointerdown", handlePointerDown)
        }, 100)

        return () => {
            clearTimeout(timer)
            document.removeEventListener("pointerdown", handlePointerDown)
        }
    }, [t.id])

    return (
        <div
            ref={containerRef}
            style={{
                position: "relative",
                paddingTop: "28px",
                paddingBottom: "20px",
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
                    color: isError ? "#7f1d1d" : "#666",
                    cursor: "pointer",
                }}
                aria-label="Close"
            >
                ×
            </button>
            <div style={{ whiteSpace: "pre-wrap" }}>{formatBoldText(message)}</div>
        </div>
    )
}
