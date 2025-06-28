import toast from "react-hot-toast";

export const successToast = (message: string) => {
    toast.success(message, {
        duration: 5000,
        position: "top-center",
    });
}

export const errorToast = (message: string) => {
    toast.error(message, {
        duration: 5000,
        position: "bottom-left",
    });
}