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
    const { school, setSchool } = useMainContext()
    const { selectedDate } = useDailyTableContext();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [btnTitle, setBtnTitle] = useState<string>("פרסום המערכת");
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
                setBtnTitle("פרסום המערכת");
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
                // Update school context to include the newly published date (Local Storage not updated, currently unused)
                setSchool(prev => prev ? { ...prev, publishDates: Array.from(new Set([...(prev.publishDates || []), selectedDate])) } : prev)
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
        const text = `קישור התחברות למורי בית הספר:\n${generateSchoolUrl(school.id)}`;
        try {
            await navigator.clipboard.writeText(text);
            successToast("הקישור הועתק בהצלחה וניתן לשלוח למורים", 3500)
        } catch {
            errorToast("לא ניתן להעתיק את הקישור, אנא פנו לתמיכה");
        }
    };

    // Open history in a new tab with selected date
    const onOpenHistory = () => {
        if (!selectedDate || !school) return;
        const base = new URL(routePath.history.p, window.location.origin);
        base.searchParams.set("date", selectedDate);
        base.searchParams.set("schoolId", school.id);
        window.open(base.toString(), "_blank", "noopener,noreferrer");
    };

    return { publishDailySchedule, isLoading, onShareLink, onOpenHistory, btnTitle, isDisabled };
};

export default usePublish;
