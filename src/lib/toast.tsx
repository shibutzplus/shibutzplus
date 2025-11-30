import { toast } from "react-hot-toast"
import { ClosableToast } from "@/components/ui/toasts/ClosableToast"

export const successToast = (message: string, duration = 5000) =>
    toast((t) => <ClosableToast t={t} message={message} variant="default" />, {
        duration,
        style: {
            background: "#e0f8e0",
            color: "#14532d",
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

export const infoToast = (message: string, duration = 5000) =>
    toast((t) => <ClosableToast t={t} message={message} variant="default" />, { duration })
