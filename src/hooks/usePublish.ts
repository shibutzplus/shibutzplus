import { publishDailyScheduleAction } from "@/app/actions/POST/publishDailyScheduleAction";
import { useDailyTableContext } from "@/context/DailyTableContext";
import { useMainContext } from "@/context/MainContext";
import { errorToast, successToast } from "@/lib/toast";
import messages from "@/resources/messages";
import { useState } from "react";

const usePublish = () => {
    const { school } = useMainContext();
    const { selectedDate } = useDailyTableContext();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const publishDailySchedule = async () => {
        try {
            setIsLoading(true);
            const response = await publishDailyScheduleAction(school?.id || "", selectedDate || "");
            if (response.success) {
                successToast(messages.publish.success);
            } else {
                errorToast(messages.publish.error);
            }
        } catch (error) {
            errorToast(messages.publish.error);
        } finally {
            setIsLoading(false);
        }
    };

    return { publishDailySchedule, isLoading };
};

export default usePublish;
