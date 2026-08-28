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
import { deleteLogsAction } from "@/app/actions/DELETE/deleteLogsAction";
import { successToast, errorToast } from "@/lib/toast";
import styles from "./page.module.css";

interface QueryOption {
    value: string;
    label: string;
    allowDelete?: boolean;
}

const QUERY_OPTIONS: QueryOption[] = [
    { value: "logs", label: "לוגים", allowDelete: true },
    { value: "publish_schedules", label: "פרסום מערכות", allowDelete: false },
];

export default function QueriesContent() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const userRole = (session?.user as any)?.role;

    const [selectedQuery, setSelectedQuery] = useState<string>("logs");
    const [logsData, setLogsData] = useState<LogQueryResult[]>([]);
    const [publishData, setPublishData] = useState<PublishScheduleQueryResult[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [searchFilter, setSearchFilter] = useState<string>("");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
    const [selectedMetadata, setSelectedMetadata] = useState<{ id: string; metadata: any } | null>(null);

    const currentQueryConfig = QUERY_OPTIONS.find((q) => q.value === selectedQuery);
    const allowDelete = Boolean(currentQueryConfig?.allowDelete);

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
            } else if (selectedQuery === "publish_schedules") {
                const res = await getPublishScheduleQueryAction();
                if (res.success && res.data) {
                    setPublishData(res.data);
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

    // Filter publish data based on search query
    const filteredPublishData = useMemo(() => {
        if (!searchFilter.trim()) return publishData;
        const q = searchFilter.toLowerCase();
        return publishData.filter((item) => {
            const nameMatch = item.name?.toLowerCase().includes(q);
            const idMatch = item.id?.toLowerCase().includes(q);
            const dateMatch = item.lastPublishDate?.toLowerCase().includes(q);
            return nameMatch || idMatch || dateMatch;
        });
    }, [publishData, searchFilter]);

    const visibleItems = selectedQuery === "logs" ? filteredLogs : filteredPublishData;
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
                dateStyle: "short",
                timeStyle: "medium",
            }).format(date);
        } catch {
            return isoString;
        }
    };

    const formatDateOnly = (dateString?: string | null) => {
        if (!dateString) return "-";
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            return new Intl.DateTimeFormat("he-IL", {
                dateStyle: "short",
            }).format(date);
        } catch {
            return dateString;
        }
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
                                            <th style={{ width: "135px" }}>תאריך ושעה</th>
                                            <th style={{ width: "140px" }}>שם בית ספר</th>
                                            <th style={{ width: "130px" }}>מזהה מורה</th>
                                            <th style={{ width: "120px" }}>שם מורה</th>
                                            <th>תיאור</th>
                                            <th style={{ width: "85px" }}>Metadata</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredLogs.map((log) => {
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
                    ) : selectedQuery === "publish_schedules" ? (
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
                                            <th style={{ width: "180px" }}>מזהה בית ספר</th>
                                            <th>שם בית ספר</th>
                                            <th style={{ width: "160px" }}>תאריך פרסום אחרון</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredPublishData.map((item) => {
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
                                                    <td className={styles.timeCell}>
                                                        {formatDateOnly(item.lastPublishDate)}
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
