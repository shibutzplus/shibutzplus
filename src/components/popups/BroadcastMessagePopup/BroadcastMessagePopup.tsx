"use client";

import React, { useState, useEffect } from "react";
import styles from "./BroadcastMessagePopup.module.css";
import { usePopup } from "@/context/PopupContext";
import { getSchoolsMinAction } from "@/app/actions/GET/getSchoolsMinAction";
import { sendBroadcastMessageAction } from "@/app/actions/POST/sendBroadcastMessageAction";
import { errorToast, successToast } from "@/lib/toast";
import Icons from "@/style/icons";
import Loading from "@/components/loading/Loading/Loading";

interface SchoolOption {
    id: string;
    name: string;
    city: string;
}

export default function BroadcastMessagePopup() {
    const { closePopup } = usePopup();

    const [schools, setSchools] = useState<SchoolOption[]>([]);
    const [selectedSchoolId, setSelectedSchoolId] = useState<string>("all");
    const [selectedTarget, setSelectedTarget] = useState<"all" | "teachers" | "managers">("all");
    const [message, setMessage] = useState<string>("");

    const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
    const [isSending, setIsSending] = useState<boolean>(false);

    useEffect(() => {
        let isMounted = true;
        const loadInitialData = async () => {
            try {
                setIsLoadingData(true);
                const schoolsRes = await getSchoolsMinAction().catch(() => []);
                if (isMounted && schoolsRes) {
                    setSchools(schoolsRes);
                }
            } catch {
                // Ignore silent fetch errors
            } finally {
                if (isMounted) {
                    setIsLoadingData(false);
                }
            }
        };

        loadInitialData();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();

        const trimmed = message.trim();
        if (!trimmed) {
            errorToast("נא להזין תוכן להודעה");
            return;
        }

        try {
            setIsSending(true);
            const res = await sendBroadcastMessageAction({
                message: trimmed,
                targetSchoolId: selectedSchoolId,
                targetAudience: selectedTarget,
            });

            if (res.success) {
                successToast(res.message || "ההודעה נשלחה בהצלחה");
                closePopup();
            } else {
                errorToast(res.message || "שגיאה בשליחת ההודעה");
            }
        } catch {
            errorToast("שגיאה בלתי צפויה בשליחת ההודעה");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>
                    <span>שליחת הודעה למשתמשים</span>
                </h3>
            </div>

            {isLoadingData ? (
                <div style={{ padding: "40px 0", display: "flex", justifyContent: "center" }}>
                    <Loading />
                </div>
            ) : (
                <form onSubmit={handleSend} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>בית ספר</label>
                        <select
                            className={styles.selectInput}
                            value={selectedSchoolId}
                            onChange={(e) => {
                                setSelectedSchoolId(e.target.value);
                                setSelectedTarget("all");
                            }}
                            disabled={isSending}
                        >
                            <option value="all">כל בתי הספר הפעילים</option>
                            {schools.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name} {s.city ? `(${s.city})` : ""}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>משתמשים</label>
                        <select
                            className={styles.selectInput}
                            value={selectedTarget}
                            onChange={(e) => setSelectedTarget(e.target.value as "all" | "teachers" | "managers")}
                            disabled={isSending}
                        >
                            {selectedSchoolId === "all" ? (
                                <>
                                    <option value="all">לכולם (כל המנהלים וכל המורים)</option>
                                    <option value="managers">לכל המנהלים בלבד</option>
                                    <option value="teachers">לכל המורים בלבד</option>
                                </>
                            ) : (
                                <>
                                    <option value="all">לכל בית הספר (מנהלים ומורים)</option>
                                    <option value="teachers">למורים בלבד</option>
                                    <option value="managers">למנהלים בלבד</option>
                                </>
                            )}
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>תוכן ההודעה</label>
                        <textarea
                            className={styles.textarea}
                            placeholder="הקלד כאן את תוכן ההודעה שתוצג כ-Toast למשתמשים בזמן אמת..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            disabled={isSending}
                            maxLength={350}
                        />
                        <div className={styles.charCount}>
                            {message.length} / 350 תווים
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <button
                            type="submit"
                            className={styles.sendButton}
                            disabled={isSending || !message.trim()}
                        >
                            {isSending ? (
                                <>
                                    <Loading size="S" color="#ffffff" />
                                    <span>שולח...</span>
                                </>
                            ) : (
                                <>
                                    <Icons.send size={18} />
                                    <span>שלח הודעה</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
