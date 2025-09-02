import { useEffect } from "react";

export const useDisablePageScroll = () => {
    useEffect(() => {
        const prevHtml = document.documentElement.style.overflow;
        const prevBody = document.body.style.overflow;
        
        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";
        
        return () => {
            document.documentElement.style.overflow = prevHtml;
            document.body.style.overflow = prevBody;
        };
    }, []);
};
