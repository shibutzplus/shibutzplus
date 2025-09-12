import { publishDailyScheduleAction } from "@/app/actions/POST/publishDailyScheduleAction";
import { useDailyTableContext } from "@/context/DailyTableContext";
import { useMainContext } from "@/context/MainContext";
import { errorToast, successToast } from "@/lib/toast";
import messages from "@/resources/messages";
import { generateSchoolUrl } from "@/utils";
import { useEffect, useState } from "react";
import { useShareTextOrLink } from "./useShareTextOrLink";
import routePath from "@/routes";
import { getSessionPublishDates, setSessionPublishDates } from "@/lib/sessionStorage";

const usePublish = () => {
    const { school } = useMainContext();
    const { selectedDate } = useDailyTableContext();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [btnTitle, setBtnTitle] = useState<string>("פרסום למורים");
    const [isDisabled, setIsDisabled] = useState<boolean>(false);
    const share = useShareTextOrLink();

    useEffect(() => {
        if (selectedDate && school) {
            const storageDates = getSessionPublishDates();
            if (storageDates?.includes(selectedDate)) {
                setBtnTitle("המערכת פורסמה");
                setIsDisabled(true);
            } else if (school.publishDates?.includes(selectedDate)) {
                setBtnTitle("המערכת פורסמה");
                setIsDisabled(true);
            } else {
                setBtnTitle("פרסום למורים");
                setIsDisabled(false);
            }
        }
    }, [school, selectedDate]);

    const publishDailySchedule = async () => {
        if (!selectedDate || !school || isDisabled) return;
        try {
            setIsLoading(true);
            const response = await publishDailyScheduleAction(school.id, selectedDate);
            if (response.success) {
                setSessionPublishDates(selectedDate);
                successToast(messages.publish.success);
                setBtnTitle("המערכת פורסמה");
                setIsDisabled(true);
            } else {
                errorToast(messages.publish.error);
            }
        } catch (error) {
            errorToast(messages.publish.error);
        } finally {
            setIsLoading(false);
        }
    };

    const onShareLink = async () => {
        if (!school) return;
        share(messages.share.daily.title, messages.share.daily.text, generateSchoolUrl(school.id));
    };

    // Open history in a new tab with selected date
    const onOpenHistory = () => {
        if (!selectedDate) return;
        const base = new URL(routePath.history.p, window.location.origin);
        base.searchParams.set("date", selectedDate);
        window.open(base.toString(), "_blank", "noopener,noreferrer");
    };

    return { publishDailySchedule, isLoading, onShareLink, onOpenHistory, btnTitle, isDisabled };
};

export default usePublish;
