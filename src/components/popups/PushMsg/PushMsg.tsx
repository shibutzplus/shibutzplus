"use client";

import React, { useEffect, useState, useRef } from "react";
import { usePopup } from "@/context/PopupContext";
import { PopupAction } from "@/context/PopupContext";
import MsgPopup from "@/components/popups/MsgPopup/MsgPopup";
import ContactUs from "@/components/faq/ContactUs/ContactUs";
import { sendAdminContactEmail } from "@/app/actions/POST/sendEmailAction";
import { getCookie, setCookie } from "@/lib/cookies";
import { successToast } from "@/lib/toast";
import { useOptionalMainContext } from "@/context/MainContext";
import { useSession } from "next-auth/react";
import { getStorageTeacher } from "@/lib/localStorage";
import { getSchoolAction } from "@/app/actions/GET/getSchoolAction";
import { logErrorAction } from "@/app/actions/POST/logErrorAction";
import { checkPushMsgClosedAction, deletePushMsgClosedAction } from "@/app/actions/tmpPushMsgActions";
import styles from "./PushMsg.module.css";

const PUSH_MSG_EXPIRES_DAYS = 10;

interface PushMsgContentProps {
    message: React.ReactNode;
}

export const PUSH_MSG_MESSAGE = (
    <div className={styles.container}>
        <div className={styles.greeting}>היי, נסיון אחרון 🙏</div>
        <div style={{ height: "10px" }} />
        <div>ממש חשוב לנו לשמוע אתכם! נשמח לכל תובנה, מחשבה או מילה טובה על השימוש שלכם במערכת.</div>
    </div>
);

export const PushMsgContent: React.FC<PushMsgContentProps> = ({ message }) => {
    const { closePopup } = usePopup();
    const context = useOptionalMainContext();
    const { data: session } = useSession();
    const sessionUserName = session?.user?.name;
    const sessionSchoolId = (session?.user as any)?.schoolId;
    const storageTeacher = getStorageTeacher();
    const teacherName = storageTeacher?.name || sessionUserName;
    const schoolId = storageTeacher?.schoolId || sessionSchoolId || context?.school?.id;

    const [schoolName, setSchoolName] = useState<string | undefined>(context?.school?.name);

    useEffect(() => {
        if (schoolId && !schoolName) {
            getSchoolAction(schoolId).then((res) => {
                if (res.success && res.data) {
                    setSchoolName(res.data.name);
                }
            });
        }
    }, [schoolId, schoolName]);

    const logDataRef = useRef({ schoolId, schoolName, teacherName, isSent: false, isUnmountingForReal: false });
    useEffect(() => {
        logDataRef.current = { schoolId, schoolName, teacherName, isSent: logDataRef.current.isSent, isUnmountingForReal: logDataRef.current.isUnmountingForReal };
    }, [schoolId, schoolName, teacherName]);

    useEffect(() => {
        const timer = setTimeout(() => {
            logDataRef.current.isUnmountingForReal = true;
        }, 200);

        return () => {
            clearTimeout(timer);
            const { schoolId, schoolName, teacherName, isSent, isUnmountingForReal } = logDataRef.current;
            if (isUnmountingForReal && !isSent) {
                void logErrorAction({
                    description: "[PushMsg] Closed",
                    schoolId: schoolId,
                    user: teacherName || "Unknown User",
                    metadata: { schoolName: schoolName || "Unknown School", teacherName: teacherName || "Unknown User" },
                });
            }
        };
    }, []);

    const handleSendContact = async (msg: string) => {
        logDataRef.current.isSent = true;
        let metaInfo = "";
        if (teacherName) metaInfo += `\n\n ${teacherName}`;
        if (schoolName) metaInfo += `\nבית הספר: ${schoolName}`;

        void deletePushMsgClosedAction(schoolId, teacherName);

        void logErrorAction({
            description: "[PushMsg] Sent",
            schoolId: schoolId,
            user: teacherName || "Unknown User",
            metadata: { schoolName: schoolName || "Unknown School", teacherName: teacherName || "Unknown User", message: msg },
        });

        await sendAdminContactEmail({
            adminName: "PushMsg Popup User",
            adminEmail: "pushmsg@shibutzplus.com",
            message: `${msg}${metaInfo}`,
        });
        successToast("תודה רבה!", 2500);
        closePopup();
    };

    return (
        <MsgPopup
            message={message}
            hideOkButton={true}
            preventGlobalClose
        >
            <div className={styles.contactWrapper}>
                <ContactUs
                    title="המשוב שלכם חשוב לנו!"
                    placeholder=""
                    onSend={handleSendContact}
                />
            </div>
        </MsgPopup>
    );
};

const PushMsg: React.FC = () => {
    const { openPopup } = usePopup();
    const context = useOptionalMainContext();
    const { data: session } = useSession();
    const sessionUserName = session?.user?.name;
    const sessionSchoolId = (session?.user as any)?.schoolId;
    const storageTeacher = getStorageTeacher();
    const teacherName = storageTeacher?.name || sessionUserName;
    const schoolId = storageTeacher?.schoolId || sessionSchoolId || context?.school?.id;

    useEffect(() => {
        // We need both schoolId and teacherName (or at least one) to check the DB
        if (!schoolId && !teacherName) return;

        // Check if already handled in this V2 round
        if (getCookie("shibutz_msg_displayed_v2")) return;

        const checkAndOpen = async () => {
            const hasClosed = await checkPushMsgClosedAction(schoolId, teacherName);
            if (hasClosed) {
                setCookie("shibutz_msg_displayed_v2", true, { expires: PUSH_MSG_EXPIRES_DAYS });
                openPopup(
                    PopupAction.msgPopup,
                    "M",
                    <PushMsgContent message={PUSH_MSG_MESSAGE} />
                );
            } else {
                // If they haven't closed it (e.g. already sent feedback or never saw it), mark so we don't query DB every time
                setCookie("shibutz_msg_displayed_v2", true, { expires: PUSH_MSG_EXPIRES_DAYS });
            }
        };

        checkAndOpen();
    }, [openPopup, schoolId, teacherName]);

    return null;
};

export default PushMsg;
