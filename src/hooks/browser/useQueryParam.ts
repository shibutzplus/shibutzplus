'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export const useQueryParam = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const getParam = (param: string, defaultValue: string = '') => {
    return searchParams.get(param) || defaultValue;
  };

  const setParam = (param: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(param, value);
    const newUrl = `${pathname}?${params.toString()}`;
    router.push(newUrl);
  };

  const setParams = (paramObj: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(paramObj).forEach(([key, value]) => {
      params.set(key, value);
    });
    const newUrl = `${pathname}?${params.toString()}`;
    router.push(newUrl);
  };

  const removeParam = (param: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(param);
    const newUrl = `${pathname}?${params.toString()}`;
    router.push(newUrl);
  };

  // Specific helpers for date and schoolId
  const getDateQ = (defaultValue: string = '') => getParam('date', defaultValue);
  const getSchoolIdQ = (defaultValue: string = '') => getParam('schoolId', defaultValue);
  
  const setDateQ = (date: string) => setParam('date', date);
  const setSchoolIdQ = (schoolId: string) => setParam('schoolId', schoolId);
  
  const setDateAndSchoolId = (date: string, schoolId: string) => {
    setParams({ date, schoolId });
  };

  // Build URL with query parameters for external use (e.g., opening in new tabs)
  const buildUrlWithParams = (baseUrl: string, params: Record<string, string>) => {
    const url = new URL(baseUrl, window.location.origin);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    return url.toString();
  };

  // Specific helper for building history URL with date and schoolId
  const buildHistoryUrl = (baseUrl: string, date: string, schoolId: string) => {
    return buildUrlWithParams(baseUrl, { date, schoolId });
  };

  return {
    getParam,
    setParam,
    setParams,
    removeParam,
    getDateQ,
    getSchoolIdQ,
    setDateQ,
    setSchoolIdQ,
    setDateAndSchoolId,
    buildUrlWithParams,
    buildHistoryUrl,
  };
};
