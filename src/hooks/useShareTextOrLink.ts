import { successToast } from "@/lib/toast";

export const useShareTextOrLink = () => {
    return (title: string, text: string, url?: string) => {
        if (navigator.share) {
            navigator.share({ title, text, url }).catch((error) => {
                if (error.name !== "AbortError" && error.name !== "NotAllowedError") {
                    console.error("Failed to copy URL:", error);
                }
            });
        } else {
            const fullText = url ? `${text}\n\n${url}` : text;
            navigator.clipboard
                .writeText(fullText)
                .then(() => {
                    successToast("הקישור הועתק בהצלחה");
                })
                .catch((error) => {
                    console.error("Failed to copy URL:", error);
                });
        }
    };
};
