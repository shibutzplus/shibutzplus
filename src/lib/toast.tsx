import { toast } from "react-hot-toast"
import { ClosableToast } from "@/components/ui/toasts/ClosableToast"

export const successToast = (message: string, duration = 7000) =>
    toast((t) => <ClosableToast t={t} message={message} variant="default" />, { duration })

export const errorToast = (message: string, duration = 7000) =>
    toast(
        (t) => <ClosableToast t={t} message={message} variant="error" />,
        {
            duration,
            style: {
                background: "#fee2e2",
                color: "#7f1d1d",
            },
        }
    )

export const infoToast = (message: string, duration = 7000) =>
    toast((t) => <ClosableToast t={t} message={message} variant="default" />, { duration })
