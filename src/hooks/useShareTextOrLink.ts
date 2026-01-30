import { successToast } from "@/lib/toast";
import { logErrorAction } from "@/app/actions/POST/logErrorAction";

export const useShareTextOrLink = () => {
    return (title: string, text: string, url?: string) => {
        if (navigator.share) {
            navigator.share({ title, text, url }).catch((error) => {
                if (error.name !== "AbortError" && error.name !== "NotAllowedError") {
                    logErrorAction({ description: `Failed to share: ${error instanceof Error ? error.message : String(error)}` });
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
                    logErrorAction({ description: `Failed to copy URL: ${error instanceof Error ? error.message : String(error)}` });
                });
        }
    };
};
