"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { STATUS_LOADING, STATUS_UNAUTH } from "@/models/constant/session";
import { DEFAULT_ERROR_REDIRECT } from "@/routes/protectedAuth";
import LoadingPage from "../loading/LoadingPage/LoadingPage";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const { status } = useSession();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (status === STATUS_UNAUTH) {
            let callbackUrl = pathname;
            if (window.location.search) {
                callbackUrl += window.location.search;
            }
            const encodedCallbackUrl = encodeURIComponent(callbackUrl);
            router.push(`${DEFAULT_ERROR_REDIRECT}?callbackUrl=${encodedCallbackUrl}`);
        }
    }, [status, router, pathname]);

    if (status === STATUS_LOADING) {
        return <LoadingPage />;
    }

    if (status === STATUS_UNAUTH) {
        return null;
    }

    return <>{children}</>;
}
