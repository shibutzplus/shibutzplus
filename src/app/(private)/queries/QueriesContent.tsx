"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import PageLayout from "@/components/layout/PageLayout/PageLayout";
import Preloader from "@/components/ui/Preloader/Preloader";
import Icons from "@/style/icons";
import { USER_ROLES } from "@/models/constant/auth";
import routePath from "@/routes";
import { getLogsQueryAction, LogQueryResult } from "@/app/actions/GET/getLogsQueryAction";
import { getPublishScheduleQueryAction, PublishScheduleQueryResult } from "@/app/actions/GET/getPublishScheduleQueryAction";
import { getUsersQueryAction, UserQueryResult } from "@/app/actions/GET/getUsersQueryAction";
import { getPushSubscribersQueryAction, PushSubscriberQueryResult } from "@/app/actions/GET/getPushSubscribersQueryAction";
import { deleteLogsAction } from "@/app/actions/DELETE/deleteLogsAction";
import { deleteUsersAction } from "@/app/actions/DELETE/deleteUsersAction";
import { deletePushSubscriptionsAction } from "@/app/actions/DELETE/deletePushSubscriptionsAction";
import { successToast, errorToast } from "@/lib/toast";
import { formatTMDintoDMY } from "@/utils/time";
import styles from "./page.module.css";

interface QueryOption {
    value: string;
    label: string;
    allowDelete?: boolean;
}

const QUERY_OPTIONS: QueryOption[] = [
    { value: "logs", label: "לוגים", allowDelete: true },
    { value: "schools", label: "בתי ספר", allowDelete: false },
    { value: "users", label: "מנהלים פעילים", allowDelete: true },
    { value: "inactive_users", label: "מנהלים לא פעילים", allowDelete: true },
    { value: "push_subscribers", label: "משתמשים רשומים לנוטיפיקציה", allowDelete: true },
];

const ROLE_TRANSLATIONS: Record<string, string> = {
    [USER_ROLES.ADMIN]: "מנהל מערכת",
    [USER_ROLES.PRINCIPAL]: "מנהל/ת",
    [USER_ROLES.DEPUTY_PRINCIPAL]: "סגן/ית",
    [USER_ROLES.TEACHER]: "מורה",
    [USER_ROLES.GUEST]: "אורח",
};

type SortDirection = "asc" | "desc";

interface SortConfig {
    key: string;
    direction: SortDirection;
}

export default function QueriesContent() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const userRole = (session?.user as any)?.role;

    const [selectedQuery, setSelectedQuery] = useState<string>("logs");
    const [logsData, setLogsData] = useState<LogQueryResult[]>([]);
    const [publishData, setPublishData] = useState<PublishScheduleQueryResult[]>([]);
    const [usersData, setUsersData] = useState<UserQueryResult[]>([]);
    const [pushSubscribersData, setPushSubscribersData] = useState<PushSubscriberQueryResult[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [searchFilter, setSearchFilter] = useState<string>("");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
    const [selectedMetadata, setSelectedMetadata] = useState<{ id: string; metadata: any } | null>(null);

    const currentQueryConfig = QUERY_OPTIONS.find((q) => q.value === selectedQuery);
    const allowDelete = Boolean(currentQueryConfig?.allowDelete);

    const handleSort = (key: string) => {
        setSortConfig((prev) => {
            if (prev?.key === key) {
                if (prev.direction === "asc") {
                    return { key, direction: "desc" };
                }
                return null;
            }
            return { key, direction: "asc" };
        });
    };

    // Ensure non-admin users cannot view this page
    useEffect(() => {
        if (status === "authenticated" && userRole !== USER_ROLES.ADMIN) {
            router.replace(routePath.schoolSelect.p);
        }
    }, [status, userRole, router]);

    // Fetch data for the active query
    const fetchQueryData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setSelectedIds([]);

        try {
            if (selectedQuery === "logs") {
                const res = await getLogsQueryAction(500);
                if (res.success && res.data) {
                    setLogsData(res.data);
                } else {
                    setError(res.error || "שגיאה בטעינת הנתונים");
                }
            } else if (selectedQuery === "schools") {
                const res = await getPublishScheduleQueryAction();
                if (res.success && res.data) {
                    setPublishData(res.data);
                } else {
                    setError(res.error || "שגיאה בטעינת הנתונים");
                }
            } else if (selectedQuery === "users") {
                const res = await getUsersQueryAction(true);
                if (res.success && res.data) {
                    setUsersData(res.data);
                } else {
                    setError(res.error || "שגיאה בטעינת הנתונים");
                }
            } else if (selectedQuery === "inactive_users") {
                const res = await getUsersQueryAction(false);
                if (res.success && res.data) {
                    setUsersData(res.data);
                } else {
                    setError(res.error || "שגיאה בטעינת הנתונים");
                }
            } else if (selectedQuery === "push_subscribers") {
                const res = await getPushSubscribersQueryAction();
                if (res.success && res.data) {
                    setPushSubscribersData(res.data);
                } else {
                    setError(res.error || "שגיאה בטעינת הנתונים");
                }
            }
        } catch (err: any) {
            setError(err?.message || "שגיאה בחיבור לשרת");
        } finally {
            setIsLoading(false);
        }
    }, [selectedQuery]);

    useEffect(() => {
        if (userRole === USER_ROLES.ADMIN) {
            fetchQueryData();
        }
    }, [fetchQueryData, userRole]);

    // Filter logs based on search query
    const filteredLogs = useMemo(() => {
        if (!searchFilter.trim()) return logsData;
        const q = searchFilter.toLowerCase();
        return logsData.filter((item) => {
            const userMatch = item.user?.toLowerCase().includes(q);
            const teacherNameMatch = item.teacherName?.toLowerCase().includes(q);
            const teacherIdMatch = item.teacherId?.toLowerCase().includes(q);
            const descMatch = item.description?.toLowerCase().includes(q);
            const schoolNameMatch = item.schoolName?.toLowerCase().includes(q);
            const schoolIdMatch = item.schoolId?.toLowerCase().includes(q);
            const metadataMatch = item.metadata ? JSON.stringify(item.metadata).toLowerCase().includes(q) : false;
            return userMatch || teacherNameMatch || teacherIdMatch || descMatch || schoolNameMatch || schoolIdMatch || metadataMatch;
        });
    }, [logsData, searchFilter]);

    // Sort logs
    const sortedLogs = useMemo(() => {
        if (!sortConfig) return filteredLogs;
        const { key, direction } = sortConfig;
        return [...filteredLogs].sort((a: any, b: any) => {
            let valA = a[key] ?? "";
            let valB = b[key] ?? "";
            if (key === "timeStamp") {
                valA = a.timeStamp || a.createdAt || "";
                valB = b.timeStamp || b.createdAt || "";
            }
            const cmp = String(valA).localeCompare(String(valB), "he", { numeric: true, sensitivity: "base" });
            return direction === "asc" ? cmp : -cmp;
        });
    }, [filteredLogs, sortConfig]);

    // Filter publish data based on search query
    const filteredPublishData = useMemo(() => {
        if (!searchFilter.trim()) return publishData;
        const q = searchFilter.toLowerCase();
        return publishData.filter((item) => {
            const nameMatch = item.name?.toLowerCase().includes(q);
            const idMatch = item.id?.toLowerCase().includes(q);
            const cityMatch = item.city?.toLowerCase().includes(q);
            const dateMatch = item.publishDates?.some(
                (d) => d.toLowerCase().includes(q) || formatTMDintoDMY(d).toLowerCase().includes(q)
            );
            return nameMatch || idMatch || cityMatch || dateMatch;
        });
    }, [publishData, searchFilter]);

    // Sort publish data
    const sortedPublishData = useMemo(() => {
        if (!sortConfig) return filteredPublishData;
        const { key, direction } = sortConfig;
        return [...filteredPublishData].sort((a: any, b: any) => {
            let valA = a[key] ?? "";
            let valB = b[key] ?? "";
            if (key === "totalPublishedDays") {
                const diff = (a.totalPublishedDays || a.publishDates?.length || 0) - (b.totalPublishedDays || b.publishDates?.length || 0);
                return direction === "asc" ? diff : -diff;
            }
            if (key === "publishDates") {
                valA = a.publishDates?.join(",") ?? "";
                valB = b.publishDates?.join(",") ?? "";
            }
            const cmp = String(valA).localeCompare(String(valB), "he", { numeric: true, sensitivity: "base" });
            return direction === "asc" ? cmp : -cmp;
        });
    }, [filteredPublishData, sortConfig]);

    // Filter users data based on search query
    const filteredUsersData = useMemo(() => {
        if (!searchFilter.trim()) return usersData;
        const q = searchFilter.toLowerCase();
        return usersData.filter((item) => {
            const nameMatch = item.name?.toLowerCase().includes(q);
            const emailMatch = item.email?.toLowerCase().includes(q);
            const idMatch = item.id?.toLowerCase().includes(q);
            const roleText = ROLE_TRANSLATIONS[item.role] || "";
            const roleMatch = item.role?.toLowerCase().includes(q) || roleText.toLowerCase().includes(q);
            const schoolIdMatch = item.schoolId?.toLowerCase().includes(q);
            const schoolNameMatch = item.schoolName?.toLowerCase().includes(q);
            return nameMatch || emailMatch || idMatch || roleMatch || schoolIdMatch || schoolNameMatch;
        });
    }, [usersData, searchFilter]);

    // Sort users data
    const sortedUsersData = useMemo(() => {
        if (!sortConfig) return filteredUsersData;
        const { key, direction } = sortConfig;
        return [...filteredUsersData].sort((a: any, b: any) => {
            let valA = a[key] ?? "";
            let valB = b[key] ?? "";
            if (key === "role") {
                valA = ROLE_TRANSLATIONS[valA] || valA;
                valB = ROLE_TRANSLATIONS[valB] || valB;
            }
            const cmp = String(valA).localeCompare(String(valB), "he", { numeric: true, sensitivity: "base" });
            return direction === "asc" ? cmp : -cmp;
        });
    }, [filteredUsersData, sortConfig]);

    // Filter push subscribers data based on search query
    const filteredPushSubscribers = useMemo(() => {
        if (!searchFilter.trim()) return pushSubscribersData;
        const q = searchFilter.toLowerCase();
        return pushSubscribersData.filter((item) => {
            const schoolMatch = item.schoolName?.toLowerCase().includes(q);
            const teacherIdMatch = item.teacherId?.toLowerCase().includes(q);
            const teacherNameMatch = item.teacherName?.toLowerCase().includes(q);
            return schoolMatch || teacherIdMatch || teacherNameMatch;
        });
    }, [pushSubscribersData, searchFilter]);

    // Sort push subscribers data
    const sortedPushSubscribers = useMemo(() => {
        if (!sortConfig) return filteredPushSubscribers;
        const { key, direction } = sortConfig;
        return [...filteredPushSubscribers].sort((a: any, b: any) => {
            if (key === "subscriptionCount") {
                const diff = (a.subscriptionCount || 0) - (b.subscriptionCount || 0);
                return direction === "asc" ? diff : -diff;
            }
            if (key === "createdAt") {
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return direction === "asc" ? dateA - dateB : dateB - dateA;
            }
            const valA = a[key] ?? "";
            const valB = b[key] ?? "";
            const cmp = String(valA).localeCompare(String(valB), "he", { numeric: true, sensitivity: "base" });
            return direction === "asc" ? cmp : -cmp;
        });
    }, [filteredPushSubscribers, sortConfig]);

    const visibleItems =
        selectedQuery === "logs"
            ? sortedLogs
            : selectedQuery === "schools"
            ? sortedPublishData
            : selectedQuery === "users" || selectedQuery === "inactive_users"
            ? sortedUsersData
            : sortedPushSubscribers;
    const totalCount = visibleItems.length;

    // Checkbox selection helpers (only relevant if allowDelete is true)
    const isAllSelected = allowDelete && totalCount > 0 && visibleItems.every((item) => selectedIds.includes(item.id));
    const isSomeSelected = allowDelete && selectedIds.length > 0 && !isAllSelected;

    const handleToggleSelectAll = () => {
        if (!allowDelete) return;
        if (isAllSelected) {
            setSelectedIds([]);
        } else {
            setSelectedIds(visibleItems.map((item) => item.id));
        }
    };

    const handleToggleSelectItem = (id: string) => {
        if (!allowDelete) return;
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    // Execute deletion of selected items (only for queries where allowDelete is true)
    const handleExecuteDelete = async () => {
        if (!allowDelete || selectedIds.length === 0) return;
        setIsDeleting(true);

        try {
            if (selectedQuery === "logs") {
                const res = await deleteLogsAction(selectedIds);
                if (res.success) {
                    successToast(`נמחקו ${selectedIds.length} רשומות בהצלחה`);
                    setSelectedIds([]);
                    setIsConfirmOpen(false);
                    await fetchQueryData();
                } else {
                    errorToast(res.error || "שגיאה במחיקת הרשומות");
                }
            } else if (selectedQuery === "users" || selectedQuery === "inactive_users") {
                const res = await deleteUsersAction(selectedIds);
                if (res.success) {
                    successToast(`נמחקו ${selectedIds.length} מנהלים/משתמשים בהצלחה`);
                    setSelectedIds([]);
                    setIsConfirmOpen(false);
                    await fetchQueryData();
                } else {
                    errorToast(res.error || "שגיאה במחיקת המשתמשים");
                }
            } else if (selectedQuery === "push_subscribers") {
                const res = await deletePushSubscriptionsAction(selectedIds);
                if (res.success) {
                    successToast(`נמחקו מנויי נוטיפיקציה עבור ${selectedIds.length} מורים בהצלחה`);
                    setSelectedIds([]);
                    setIsConfirmOpen(false);
                    await fetchQueryData();
                } else {
                    errorToast(res.error || "שגיאה במחיקת מנויי הנוטיפיקציה");
                }
            }
        } catch (err: any) {
            errorToast(err?.message || "שגיאה בביצוע המחיקה");
        } finally {
            setIsDeleting(false);
        }
    };

    const formatDateTime = (isoString?: string | null) => {
        if (!isoString) return "-";
        try {
            const date = new Date(isoString);
            if (isNaN(date.getTime())) return isoString;
            return new Intl.DateTimeFormat("he-IL", {
                timeZone: "Asia/Jerusalem",
                dateStyle: "short",
                timeStyle: "medium",
            }).format(date);
        } catch {
            return isoString;
        }
    };

    const renderSortHeader = (label: string, sortKey: string, width?: string) => {
        const isSorted = sortConfig?.key === sortKey;
        const dir = isSorted ? sortConfig.direction : null;
        return (
            <th
                style={{ width }}
                className={styles.sortableHeader}
                onClick={() => handleSort(sortKey)}
                title={`לחץ למיון לפי ${label}`}
            >
                <div className={styles.headerContent}>
                    <span>{label}</span>
                    <span className={`${styles.sortIcon} ${isSorted ? styles.sortIconActive : ""}`}>
                        {dir === "asc" ? "▲" : dir === "desc" ? "▼" : "⇅"}
                    </span>
                </div>
            </th>
        );
    };

    return (
        <PageLayout
            appType="private"
            HeaderRightActions={
                <h3 className={styles.pageTitle}>שאילתות</h3>
            }
        >
            <div className={styles.container}>
                {/* Compact Top Toolbar */}
                <div className={styles.topBar}>
                    <div className={styles.controlsGroup}>
                        <select
                            className={styles.selectInput}
                            value={selectedQuery}
                            onChange={(e) => {
                                setSelectedQuery(e.target.value);
                                setSelectedIds([]);
                                setSortConfig(null);
                            }}
                        >
                            {QUERY_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>

                        <input
                            type="text"
                            placeholder="חיפוש חופשי..."
                            value={searchFilter}
                            onChange={(e) => setSearchFilter(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>

                    <div className={styles.actionsGroup}>
                        <span className={styles.countBadge}>
                            {isLoading ? "טוען..." : `סה״כ: ${totalCount}`}
                        </span>

                        {allowDelete && (
                            <button
                                onClick={() => setIsConfirmOpen(true)}
                                disabled={selectedIds.length === 0 || isLoading || isDeleting}
                                className={styles.deleteButton}
                                title="מחק שורות נבחרות"
                            >
                                <Icons.delete size={14} />
                                <span>מחיקה {selectedIds.length > 0 && `(${selectedIds.length})`}</span>
                            </button>
                        )}

                        <button
                            onClick={fetchQueryData}
                            disabled={isLoading || isDeleting}
                            className={styles.refreshButton}
                            title="רענן"
                        >
                            <span className={isLoading ? styles.refreshIconRotating : ""}>
                                <Icons.refresh size={14} />
                            </span>
                            <span>רענון</span>
                        </button>
                    </div>
                </div>

                {/* Dense Table Card */}
                <div className={styles.tableCard}>
                    {isLoading ? (
                        <div className={styles.stateContainer}>
                            <Preloader />
                            <span>שולף נתונים...</span>
                        </div>
                    ) : error ? (
                        <div className={styles.errorContainer}>
                            <Icons.warning size={24} />
                            <span>{error}</span>
                            <button onClick={fetchQueryData} className={styles.refreshButton}>
                                נסה שוב
                            </button>
                        </div>
                    ) : selectedQuery === "logs" ? (
                        filteredLogs.length === 0 ? (
                            <div className={styles.stateContainer}>
                                <span className={styles.emptyText}>אין נתונים להצגה</span>
                            </div>
                        ) : (
                            <div className={styles.tableWrapper}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            {allowDelete && (
                                                <th style={{ width: "36px", textAlign: "center" }}>
                                                    <input
                                                        type="checkbox"
                                                        className={styles.checkbox}
                                                        checked={isAllSelected}
                                                        ref={(el) => {
                                                            if (el) el.indeterminate = isSomeSelected;
                                                        }}
                                                        onChange={handleToggleSelectAll}
                                                        title="בחר / בטל הכל"
                                                    />
                                                </th>
                                            )}
                                            {renderSortHeader("תאריך ושעה", "timeStamp", "145px")}
                                            {renderSortHeader("שם בית ספר", "schoolName", "150px")}
                                            {renderSortHeader("מזהה מורה", "teacherId", "130px")}
                                            {renderSortHeader("שם מורה", "teacherName", "130px")}
                                            {renderSortHeader("תיאור", "description")}
                                            <th style={{ width: "85px" }}>Metadata</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedLogs.map((log) => {
                                            const hasMetadata = log.metadata && Object.keys(log.metadata).length > 0;
                                            const isChecked = selectedIds.includes(log.id);
                                            return (
                                                <tr key={log.id} style={{ backgroundColor: isChecked ? "#f0f7ff" : undefined }}>
                                                    {allowDelete && (
                                                        <td style={{ textAlign: "center" }}>
                                                            <input
                                                                type="checkbox"
                                                                className={styles.checkbox}
                                                                checked={isChecked}
                                                                onChange={() => handleToggleSelectItem(log.id)}
                                                            />
                                                        </td>
                                                    )}
                                                    <td className={styles.timeCell}>
                                                        {formatDateTime(log.timeStamp || log.createdAt)}
                                                    </td>
                                                    <td>
                                                        {log.schoolName ? (
                                                            <span className={styles.schoolBadge}>
                                                                {log.schoolName}
                                                            </span>
                                                        ) : (
                                                            <span style={{ color: "#94a3b8" }}>—</span>
                                                        )}
                                                    </td>
                                                    <td style={{ fontFamily: "monospace", fontSize: "0.78rem", color: "#475569", direction: "ltr", textAlign: "right" }}>
                                                        {log.teacherId || log.user || "—"}
                                                    </td>
                                                    <td className={styles.userCell}>
                                                        {log.teacherName || log.user || "—"}
                                                    </td>
                                                    <td className={styles.descriptionCell}>
                                                        {log.description}
                                                    </td>
                                                    <td>
                                                        {hasMetadata ? (
                                                            <button
                                                                onClick={() => setSelectedMetadata({ id: log.id, metadata: log.metadata })}
                                                                className={styles.metadataButton}
                                                            >
                                                                <Icons.eye size={12} />
                                                                <span>JSON</span>
                                                            </button>
                                                        ) : (
                                                            <span style={{ color: "#cbd5e1" }}>—</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )
                    ) : selectedQuery === "schools" ? (
                        filteredPublishData.length === 0 ? (
                            <div className={styles.stateContainer}>
                                <span className={styles.emptyText}>אין נתונים להצגה</span>
                            </div>
                        ) : (
                            <div className={styles.tableWrapper}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            {allowDelete && (
                                                <th style={{ width: "36px", textAlign: "center" }}>
                                                    <input
                                                        type="checkbox"
                                                        className={styles.checkbox}
                                                        checked={isAllSelected}
                                                        ref={(el) => {
                                                            if (el) el.indeterminate = isSomeSelected;
                                                        }}
                                                        onChange={handleToggleSelectAll}
                                                        title="בחר / בטל הכל"
                                                    />
                                                </th>
                                            )}
                                            {renderSortHeader("מזהה בית ספר", "id", "160px")}
                                            {renderSortHeader("שם בית ספר", "name", "160px")}
                                            {renderSortHeader("עיר", "city", "130px")}
                                            {renderSortHeader("שעות (מ-עד)", "fromHour", "110px")}
                                            {renderSortHeader("מספר ימים", "totalPublishedDays", "105px")}
                                            {renderSortHeader("תאריכים שפורסמו", "publishDates")}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedPublishData.map((item) => {
                                            const isChecked = selectedIds.includes(item.id);
                                            return (
                                                <tr key={item.id} style={{ backgroundColor: isChecked ? "#f0f7ff" : undefined }}>
                                                    {allowDelete && (
                                                        <td style={{ textAlign: "center" }}>
                                                            <input
                                                                type="checkbox"
                                                                className={styles.checkbox}
                                                                checked={isChecked}
                                                                onChange={() => handleToggleSelectItem(item.id)}
                                                            />
                                                        </td>
                                                    )}
                                                    <td style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "#475569", direction: "ltr", textAlign: "right" }}>
                                                        {item.id}
                                                    </td>
                                                    <td style={{ fontWeight: 600, color: "#1e293b" }}>
                                                        {item.name}
                                                    </td>
                                                    <td>
                                                        {item.city ? (
                                                            <span style={{ color: "#334155" }}>{item.city}</span>
                                                        ) : (
                                                            <span style={{ color: "#94a3b8" }}>—</span>
                                                        )}
                                                    </td>
                                                    <td style={{ textAlign: "center", color: "#475569", fontWeight: 500, direction: "ltr" }}>
                                                        {item.fromHour} - {item.toHour}
                                                    </td>
                                                    <td style={{ textAlign: "center" }}>
                                                        <span className={styles.dateCountBadge}>
                                                            {item.totalPublishedDays || item.publishDates?.length || 0}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className={styles.dateChipList}>
                                                            {item.publishDates && item.publishDates.length > 0 ? (
                                                                item.publishDates.map((dateStr) => (
                                                                    <span key={dateStr} className={styles.dateChip} title={dateStr}>
                                                                        {formatTMDintoDMY(dateStr)}
                                                                    </span>
                                                                ))
                                                            ) : (
                                                                <span style={{ color: "#94a3b8" }}>—</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )
                    ) : selectedQuery === "users" || selectedQuery === "inactive_users" ? (
                        filteredUsersData.length === 0 ? (
                            <div className={styles.stateContainer}>
                                <span className={styles.emptyText}>אין נתונים להצגה</span>
                            </div>
                        ) : (
                            <div className={styles.tableWrapper}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            {allowDelete && (
                                                <th style={{ width: "36px", textAlign: "center" }}>
                                                    <input
                                                        type="checkbox"
                                                        className={styles.checkbox}
                                                        checked={isAllSelected}
                                                        ref={(el) => {
                                                            if (el) el.indeterminate = isSomeSelected;
                                                        }}
                                                        onChange={handleToggleSelectAll}
                                                        title="בחר / בטל הכל"
                                                    />
                                                </th>
                                            )}
                                            {renderSortHeader("קוד בית ספר", "schoolId", "140px")}
                                            {renderSortHeader("שם בית ספר", "schoolName", "160px")}
                                            {renderSortHeader("מזהה משתמש", "id", "160px")}
                                            {renderSortHeader("שם", "name", "150px")}
                                            {renderSortHeader("אימייל", "email", "200px")}
                                            {renderSortHeader("תפקיד", "role")}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedUsersData.map((user) => {
                                            const isChecked = selectedIds.includes(user.id);
                                            return (
                                                <tr key={user.id} style={{ backgroundColor: isChecked ? "#f0f7ff" : undefined }}>
                                                    {allowDelete && (
                                                        <td style={{ textAlign: "center" }}>
                                                            <input
                                                                type="checkbox"
                                                                className={styles.checkbox}
                                                                checked={isChecked}
                                                                onChange={() => handleToggleSelectItem(user.id)}
                                                            />
                                                        </td>
                                                    )}
                                                    <td style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "#475569", direction: "ltr", textAlign: "right" }}>
                                                        {user.schoolId || <span style={{ color: "#94a3b8" }}>—</span>}
                                                    </td>
                                                    <td>
                                                        {user.schoolName ? (
                                                            <span className={styles.schoolBadge}>
                                                                {user.schoolName}
                                                            </span>
                                                        ) : (
                                                            <span style={{ color: "#94a3b8" }}>—</span>
                                                        )}
                                                    </td>
                                                    <td style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "#475569", direction: "ltr", textAlign: "right" }}>
                                                        {user.id}
                                                    </td>
                                                    <td style={{ fontWeight: 600, color: "#1e293b" }}>
                                                        {user.name}
                                                    </td>
                                                    <td className={styles.emailCell}>
                                                        {user.email}
                                                    </td>
                                                    <td>
                                                        <span className={styles.roleBadge}>
                                                            {ROLE_TRANSLATIONS[user.role] || user.role}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )
                    ) : selectedQuery === "push_subscribers" ? (
                        filteredPushSubscribers.length === 0 ? (
                            <div className={styles.stateContainer}>
                                <span className={styles.emptyText}>אין נתונים להצגה</span>
                            </div>
                        ) : (
                            <div className={styles.tableWrapper}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            {allowDelete && (
                                                <th style={{ width: "36px", textAlign: "center" }}>
                                                    <input
                                                        type="checkbox"
                                                        className={styles.checkbox}
                                                        checked={isAllSelected}
                                                        ref={(el) => {
                                                            if (el) el.indeterminate = isSomeSelected;
                                                        }}
                                                        onChange={handleToggleSelectAll}
                                                        title="בחר / בטל הכל"
                                                    />
                                                </th>
                                            )}
                                            {renderSortHeader("שם בית ספר", "schoolName", "180px")}
                                            {renderSortHeader("קוד מורה", "teacherId", "160px")}
                                            {renderSortHeader("שם מורה", "teacherName", "160px")}
                                            {renderSortHeader("כמה פעמים נרשם", "subscriptionCount", "140px")}
                                            {renderSortHeader("תאריך הרשמה", "createdAt", "170px")}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedPushSubscribers.map((item) => {
                                            const isChecked = selectedIds.includes(item.id);
                                            return (
                                                <tr key={item.teacherId} style={{ backgroundColor: isChecked ? "#f0f7ff" : undefined }}>
                                                    {allowDelete && (
                                                        <td style={{ textAlign: "center" }}>
                                                            <input
                                                                type="checkbox"
                                                                className={styles.checkbox}
                                                                checked={isChecked}
                                                                onChange={() => handleToggleSelectItem(item.id)}
                                                            />
                                                        </td>
                                                    )}
                                                    <td style={{ fontWeight: 600, color: "#1e293b" }}>
                                                        {item.schoolName}
                                                    </td>
                                                    <td style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "#475569", direction: "ltr", textAlign: "right" }}>
                                                        {item.teacherId}
                                                    </td>
                                                    <td style={{ fontWeight: 600, color: "#334155" }}>
                                                        {item.teacherName}
                                                    </td>
                                                    <td style={{ textAlign: "center" }}>
                                                        <span className={styles.dateCountBadge}>
                                                            {item.subscriptionCount}
                                                        </span>
                                                    </td>
                                                    <td style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "#475569", direction: "ltr", textAlign: "right" }}>
                                                        {item.createdAt ? formatDateTime(item.createdAt) : "—"}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )
                    ) : null}
                </div>
            </div>

            {/* Confirmation Delete Dialog */}
            {isConfirmOpen && allowDelete && (
                <div className={styles.modalOverlay} onClick={() => !isDeleting && setIsConfirmOpen(false)}>
                    <div className={styles.confirmDialog} onClick={(e) => e.stopPropagation()}>
                        <h4 className={styles.confirmTitle}>אישור מחיקה</h4>
                        <p className={styles.confirmSubtitle}>
                            האם אתה בטוח שברצונך למחוק {selectedIds.length} {selectedIds.length === 1 ? "שורה" : "שורות"}?
                        </p>
                        <div className={styles.confirmActions}>
                            <button
                                onClick={handleExecuteDelete}
                                disabled={isDeleting}
                                className={styles.confirmBtnDanger}
                            >
                                {isDeleting ? "מוחק..." : "כן, מחק"}
                            </button>
                            <button
                                onClick={() => setIsConfirmOpen(false)}
                                disabled={isDeleting}
                                className={styles.confirmBtnCancel}
                            >
                                ביטול
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Compact Metadata Modal */}
            {selectedMetadata && (
                <div className={styles.modalOverlay} onClick={() => setSelectedMetadata(null)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h4 className={styles.modalTitle}>Metadata ({selectedMetadata.id.slice(0, 8)})</h4>
                            <button
                                onClick={() => setSelectedMetadata(null)}
                                className={styles.closeModalBtn}
                                aria-label="סגור"
                            >
                                <Icons.close size={18} />
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            <pre className={styles.jsonPre}>
                                {JSON.stringify(selectedMetadata.metadata, null, 2)}
                            </pre>
                        </div>
                    </div>
                </div>
            )}
        </PageLayout>
    );
}
