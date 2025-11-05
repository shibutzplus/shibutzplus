"use client"
import React from "react"
import { SessionProvider } from "next-auth/react"
import { Toaster } from "react-hot-toast"
import { PopupProvider } from "@/context/PopupContext"

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <PopupProvider>
                {children}
                <Toaster
                    containerStyle={{
                        position: "fixed",
                        top: "60%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                    }}
                    toastOptions={{
                        duration: 7000,
                        style: {
                            background: "#fff8e1",
                            color: "#4a3b00",
                            fontSize: "1.2rem",
                            padding: "4px 10px",
                            minHeight: "120px",
                            minWidth: "350px",
                            borderRadius: "16px",
                            boxShadow: "0 18px 45px rgba(15, 23, 42, 0.18)",
                        },
                    }}
                />
            </PopupProvider>
        </SessionProvider>
    )
}
