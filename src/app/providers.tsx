"use client"
import React from "react"
import { SessionProvider } from "next-auth/react"
import { Toaster } from "react-hot-toast"
import { PopupProvider } from "@/context/PopupContext"
import { BorderRadiusCell, DarkTextColor, FontSize, TabColor } from "@/style/root"

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
                        duration: 5000,
                        style: {
                            background: TabColor,
                            color: DarkTextColor,
                            fontSize: FontSize,
                            padding: "4px 10px",
                            minHeight: "120px",
                            minWidth: "310px",
                            lineHeight: "2rem",
                            borderRadius: BorderRadiusCell,
                            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.5)",
                        },
                    }}
                />
            </PopupProvider>
        </SessionProvider>
    )
}
