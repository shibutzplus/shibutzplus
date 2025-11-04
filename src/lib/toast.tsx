import toast from "react-hot-toast";

export const successToast = (message: string) => toast(message, { icon: null })
export const errorToast = (message: string) => toast.error(message, { icon: "🚫" })
export const infoToast = (message: string) => toast(message, { icon: null })
