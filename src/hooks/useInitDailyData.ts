"use client";

import { useSession } from "next-auth/react";
import { DailyScheduleType } from "@/models/types/dailySchedule";
import { useEffect, useRef } from "react";
import { getCacheTimestamp, setCacheTimestamp } from "@/utils/localStorage";
import { getDailyScheduleAction } from "@/app/actions/GET/getDailyScheduleAction";
import { CACHE_EXPIRATION } from "@/utils/time";

interface useInitDailyDataProps {
    dailyScheduleRawData: DailyScheduleType[] | undefined;
    setDailyScheduleRawData: (dailySchedule: DailyScheduleType[] | undefined) => void;
}

/**
 * Initialize data for the app
 * Fetches data only when needed and minimizes redundant requests
 */
const useInitDailyData = ({ dailyScheduleRawData, setDailyScheduleRawData }: useInitDailyDataProps) => {
    const { data: session, status } = useSession();
    const BlockFetchRef = useRef<boolean>(false);
    const lastFetchTimeRef = useRef<number>(0);

    useEffect(() => {
        const fetchData = async (schoolId: string) => {
            try {
                // Check if we already have data and if the cache is still fresh
                const currentTime = Date.now();
                const lastCacheTime = Number(getCacheTimestamp() || '0');
                const cacheExpired = (currentTime - lastCacheTime) > CACHE_EXPIRATION;
                const shouldFetch = 
                    !dailyScheduleRawData || 
                    cacheExpired || 
                    (currentTime - lastFetchTimeRef.current > CACHE_EXPIRATION);

                if (shouldFetch && !BlockFetchRef.current) {
                    BlockFetchRef.current = true;
                    const dailyRes = await getDailyScheduleAction(schoolId);

                    if (dailyRes && dailyRes.success && dailyRes.data) {
                        setDailyScheduleRawData(dailyRes.data);
                        lastFetchTimeRef.current = currentTime;
                        setCacheTimestamp(currentTime.toString());
                    }
                }
            } catch (error) {
                console.error("Error fetching daily schedule data:", error);
                BlockFetchRef.current = false;
            }
        };

        if (
            status === "authenticated" &&
            typeof window !== "undefined" &&
            session?.user?.schoolId
        ) {
            fetchData(session.user.schoolId);
        }
        
        // Reset fetch flag when dependencies change
        return () => {
            BlockFetchRef.current = false;
        };
    }, [session, status, dailyScheduleRawData, setDailyScheduleRawData]);
};

export default useInitDailyData;
