"use client";

import { useSession } from "next-auth/react";
import { DailyScheduleType } from "@/models/types/dailySchedule";
import { useEffect } from "react";
import { setCacheTimestamp } from "@/utils/localStorage";
import { getDailyScheduleAction as getDailyScheduleFromDB } from "@/app/actions/getDailyScheduleAction";

interface useInitDailyDataProps {
    dailyScheduleData: DailyScheduleType[] | undefined;
    setDailyScheduleData: (dailySchedule: DailyScheduleType[] | undefined) => void;
}

// TODO: try to minimize the amount of time data try to fetch

/**
 * Initialize data for the app
 * Checks local storage for data, if not found, fetches from server
 */
const useInitDailyData = ({ dailyScheduleData, setDailyScheduleData }: useInitDailyDataProps) => {
    const { data: session, status } = useSession();

    useEffect(() => {
        const fetchData = async (schoolId: string) => {
            try {
                let dailyPromise;

                // No cache for daily schedule
                if (!dailyScheduleData) {
                    dailyPromise = getDailyScheduleFromDB(schoolId);
                }

                const [dailyRes] = await Promise.all([dailyPromise || Promise.resolve(null)]);

                if (dailyRes && dailyRes.success && dailyRes.data) {
                    setDailyScheduleData(dailyRes.data);
                }

                // Update cache timestamp if any data was fetched
                if (dailyPromise) {
                    setCacheTimestamp(Date.now().toString());
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        if (
            status === "authenticated" &&
            typeof window !== "undefined" &&
            session?.user?.schoolId
        ) {
            console.log("session.user.schoolId", session.user.schoolId);
            fetchData(session.user.schoolId);
        }
    }, [session, status]);
};

export default useInitDailyData;
