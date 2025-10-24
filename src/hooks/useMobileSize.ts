"use client";

import { useState, useEffect } from "react";

/**
 * useMobileSize
 * Returns true if window.innerWidth < 768 (mobile), false otherwise.
 * SSR-safe: always returns false on server, updates on client.
 */
export function useMobileSize(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
}
