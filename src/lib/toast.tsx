import toast from "react-hot-toast";

export const successToast = (message: string) => {
    toast.success(message, {
        duration: 7000,
        position: "bottom-center",
    });
}

export const errorToast = (message: string) => {
    toast.error(message, {
        duration: 7000,
        position: "bottom-center",
    });
}

export const infoToast = (message: string) => {
    toast(message, {
        duration: 7000,
        position: "bottom-center",
        icon: "ℹ️",
    });
};