
import Logo from "@/components/ui/Logo/Logo";
import { Metadata } from "next";

export const metadata: Metadata = {
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
};

export default function LegalLayout({ children }: { children: React.ReactNode }) {
    return (
        <div style={{
            width: "100%",
            height: "100dvh",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "var(--background-color)"
        }}>
            <header style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                height: "var(--header-height)",
                background: "var(--top-color)",
                padding: "0 var(--padding-width)",
                boxShadow: "var(--box-shadow-primary)",
                zIndex: 10,
            }}>
                <div style={{ marginLeft: 0 }}>
                    <Logo />
                </div>
            </header>
            <main style={{
                flex: "1 1 auto",
                minHeight: 0,
                overflow: "auto",
                width: "100%"
            }}>
                {children}
            </main>
        </div>
    );
}
