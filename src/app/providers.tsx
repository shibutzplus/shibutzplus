"use client"
import React from "react"
import { SessionProvider } from "next-auth/react"
import { Toaster } from "react-hot-toast"
import { PopupProvider } from "@/context/PopupContext"
import { BorderRadiusCell, BoxShadowPrimary, DarkTextColor, FontSize, TabColor } from "@/style/root"

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
                            background: TabColor,
                            color: DarkTextColor,
                            fontSize: FontSize,
                            padding: "4px 10px",
                            minHeight: "120px",
                            minWidth: "310px",
                            lineHeight: "2rem",
                            borderRadius: BorderRadiusCell,
                            boxShadow: BoxShadowPrimary,
                        },
                    }}
                />
            </PopupProvider>
        </SessionProvider>
    )
}
