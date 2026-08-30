import { toast } from "react-hot-toast"
import { ClosableToast } from "@/components/ui/toasts/ClosableToast"
import { BroadcastToast } from "@/components/ui/toasts/BroadcastToast"

export const successToast = (message: string, duration = 5000) =>
    toast((t) => <ClosableToast t={t} message={message} variant="default" />, {
        duration,
        style: {
            background: "#F3F3F7",
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.5)",
        },
    })

export const errorToast = (message: string, duration = 5000) =>
    toast(
        (t) => <ClosableToast t={t} message={message} variant="error" />,
        {
            duration,
            style: {
                background: "#fff4e5",
                color: "#7f1d1d",
                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.5)",
            },
        }
    )

export const cellToast = (message: string, duration = 5000) =>
    toast((t) => <ClosableToast t={t} message={message} variant="default" />, {
        id: "cell-preview-toast",
        duration,
        style: {
            background: "#FFFFFF",
            border: "8px solid #eee",
            color: "#333",
            borderRadius: "12px",
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.5)",
        },
    })

export const broadcastToast = (message: string, senderName?: string, duration = Infinity) =>
    toast((t) => <BroadcastToast t={t} message={message} senderName={senderName} />, {
        duration,
        style: {
            background: "#FFFFFF",
            border: "2px solid #8572CE",
            boxShadow: "0px 12px 36px rgba(0, 0, 0, 0.28), 0px 4px 18px rgba(133, 114, 206, 0.45)",
        },
    })

