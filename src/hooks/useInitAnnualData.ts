"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { getAnnualScheduleAction as getAnnualScheduleFromDB } from "@/app/actions/GET/getAnnualScheduleAction";
import { STATUS_AUTH } from "@/models/constant/session";
import { AnnualScheduleType } from "@/models/types/annualSchedule";
import { setCacheTimestamp } from "@/lib/localStorage";

interface useInitAnnualDataProps {
    annualScheduleTable: AnnualScheduleType[] | undefined;
    setAnnualScheduleTable: (annualSchedule: AnnualScheduleType[] | undefined) => void;
    schoolId?: string;
}

/**
 * Initialize data for the app
 * Checks local storage for data, if not found, fetches from server
 */
const useInitAnnualData = ({
    annualScheduleTable,
    setAnnualScheduleTable,
    schoolId,
}: useInitAnnualDataProps) => {
    const { data: session, status } = useSession();
    useEffect(() => {
        const fetchData = async (schoolId: string) => {
            try {
                let annualPromise;

                // No cache for annual schedule
                if (!annualScheduleTable) {
                    annualPromise = getAnnualScheduleFromDB(schoolId);
                }

                const [annualRes] = await Promise.all([annualPromise || Promise.resolve(null)]);

                if (annualRes && annualRes.success && annualRes.data) {
                    setAnnualScheduleTable(annualRes.data);
                }

                // Update cache timestamp if any data was fetched
                if (annualPromise) {
                    setCacheTimestamp(Date.now().toString());
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        if (typeof window !== "undefined") {
            // prefer schoolId passed from MainContext; fallback to session user
            const effectiveId = schoolId || (status === STATUS_AUTH && session?.user?.schoolId ? session.user.schoolId : undefined);

            if (effectiveId) {
                fetchData(effectiveId);
            }
        }
    }, [session, status, annualScheduleTable, schoolId]);
};

export default useInitAnnualData;
