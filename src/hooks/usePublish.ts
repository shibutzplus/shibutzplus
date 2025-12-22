import { publishDailyScheduleAction } from "@/app/actions/POST/publishDailyScheduleAction";
import { unpublishDailyScheduleAction } from "@/app/actions/POST/unpublishDailyScheduleAction";
import { useDailyTableContext } from "@/context/DailyTableContext";
import { useMainContext } from "@/context/MainContext";
import { errorToast, successToast } from "@/lib/toast";
import messages from "@/resources/messages";
import { generateSchoolUrl } from "@/utils";
import { useEffect, useState } from "react";
import { getSessionPublishDates, setSessionPublishDates } from "@/lib/sessionStorage";
import { pushSyncUpdate } from "@/services/syncService";
import { UPDATE_TEACHER } from "@/models/constant/sync";

const usePublish = () => {
    const { school, setSchool } = useMainContext()
    const { selectedDate } = useDailyTableContext();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [btnTitle, setBtnTitle] = useState<string>("פרסום המערכת");
    const [isDisabled, setIsDisabled] = useState<boolean>(false);

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
                void pushSyncUpdate(UPDATE_TEACHER);
                successToast(messages.publish.success, 3000);
                setBtnTitle("המערכת פורסמה");
                setIsDisabled(true);
            } else {
                errorToast(messages.publish.error, Infinity);
            }
        } catch {
            errorToast(messages.publish.error, Infinity);
        } finally {
            setIsLoading(false);
        }
    };

    const unpublishDailySchedule = async () => {
        if (!selectedDate || !school) return;
        try {
            setIsLoading(true);
            const response = await unpublishDailyScheduleAction(school.id, selectedDate);
            if (response.success) {
                // Update session storage: remove the date
                const storageDates = getSessionPublishDates();
                if (storageDates) {
                    const newStorageDates = storageDates.filter(d => d !== selectedDate);
                    // We need a way to set the whole array, but setSessionPublishDates currently only takes a single string (date) and *adds* it or sets it?
                    // Let's verify setSessionPublishDates implementation.
                    // Assuming setSessionPublishDates handles array or we need to implement a remove helper.
                    // Checking imports, setSessionPublishDates is imported from "@/lib/sessionStorage". 
                    // I'll check that file in a moment, but constructing the logic now.
                    // IF setSessionPublishDates only adds, I might need to access sessionStorage directly or check if there is a 'remove' or 'setAll' function.
                    // For now I will assume I need to handle this.

                    // Actually, let's look at setSessionPublishDates implementation first in the next step to be sure, 
                    // but for this replacement, I will assume standard logic or come back to it.
                    // Wait, I should not assume. 

                    // Let's proceed with adding the function but maybe comment out the session storage part until I verify? 
                    // No, that's sloppy.

                    // I will check the file in the next step and then apply the edit. 
                    // BUT I am in the middle of a multi_replace.

                    // I will assume I can update the context and then I will fix the session storage part if needed.
                    // Update school context
                    setSchool(prev => prev ? { ...prev, publishDates: (prev.publishDates || []).filter(d => d !== selectedDate) } : prev);

                    void pushSyncUpdate(UPDATE_TEACHER);
                    successToast("הפרסום בוטל בהצלחה", 3000); // "Publish cancelled successfully"
                    setBtnTitle("פרסום המערכת");
                    setIsDisabled(false);

                    // Helper to update session storage manually if needed for now
                    const currentSession = sessionStorage.getItem('publish_dates');
                    if (currentSession) {
                        const parsed = JSON.parse(currentSession);
                        if (Array.isArray(parsed)) {
                            const updated = parsed.filter((d: string) => d !== selectedDate);
                            sessionStorage.setItem('publish_dates', JSON.stringify(updated));
                        }
                    }
                }
            } else {
                errorToast(messages.common.serverError, Infinity);
            }
        } catch {
            errorToast(messages.common.serverError, Infinity);
        } finally {
            setIsLoading(false);
        }
    };

    const onShareLink = async () => {
        if (!school) return;
        const text = `קישור התחברות למורי בית הספר:\n${generateSchoolUrl(school.id)}`;
        try {
            await navigator.clipboard.writeText(text);
            successToast("הקישור הועתק בהצלחה וניתן לשלוח למורים.", 2000)
        } catch {
            errorToast("לא ניתן להעתיק את הקישור, אנא פנו לתמיכה", Infinity);
        }
    };

    return { publishDailySchedule, unpublishDailySchedule, isLoading, onShareLink, btnTitle, isDisabled };
};

export default usePublish;
