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
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                    }}
                    toastOptions={{ duration: 7000 }}
                />
            </PopupProvider>
        </SessionProvider>
    )
}
