"use client";

import React, { useEffect, useState } from "react";
import { usePopup } from "@/context/PopupContext";
import { PopupAction } from "@/context/PopupContext";
import MsgPopup from "@/components/popups/MsgPopup/MsgPopup";
import ContactUs from "@/components/faq/ContactUs/ContactUs";
import { sendAdminContactEmail } from "@/app/actions/POST/sendEmailAction";
import { getCookie, setCookie, COOKIES_KEYS } from "@/lib/cookies";
import { successToast } from "@/lib/toast";
import { useOptionalMainContext } from "@/context/MainContext";
import { useSession } from "next-auth/react";
import { getStorageTeacher } from "@/lib/localStorage";
import { getSchoolAction } from "@/app/actions/GET/getSchoolAction";
import styles from "./PushMsg.module.css";

const PUSH_MSG_EXPIRES_DAYS = 20;
const PUSH_MSG_ENABLED = true; // *** Set to false to disable the entire notification mechanism ***

interface PushMsgContentProps {
    message: React.ReactNode;
}

export const PUSH_MSG_MESSAGE = (
    <div className={styles.container}>
        <div className={styles.greeting}>היי,</div>
        <div>רגע לפני ששנת הלימודים מסתיימת 🎉</div>
        <div style={{ height: "10px" }} />
        <div>נשמח מאוד לשמוע אתכם! נשמח לכל תובנה, מחשבה או מילה טובה על השימוש שלכם במערכת.</div>
    </div>
);

export const PushMsgContent: React.FC<PushMsgContentProps> = ({ message }) => {
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

    const handleSendContact = async (msg: string) => {
        let metaInfo = "";
        if (teacherName) metaInfo += `\n\n ${teacherName}`;
        if (schoolName) metaInfo += `\nבית הספר: ${schoolName}`;

        await sendAdminContactEmail({
            adminName: "PushMsg Popup User",
            adminEmail: "pushmsg@shibutzplus.com",
            message: `${msg}${metaInfo}`,
        });
        successToast("תודה רבה!", 2500);
    };

    return (
        <MsgPopup
            message={message}
            hideOkButton={true}
            preventGlobalClose
        >
            <div className={styles.contactWrapper}>
                <ContactUs
                    title="נותנים משוב בתעודה 😉"
                    placeholder=""
                    onSend={handleSendContact}
                />
                <div className={styles.facebookPrompt}>
                    נשמח גם ל-<a href="https://www.facebook.com/shibutzplus" target="_blank" rel="noopener noreferrer" className={styles.facebookLink}>Like בפייסבוק</a> אם במקרה אתם שם 🙏
                </div>
            </div>
        </MsgPopup>
    );
};

const PushMsg: React.FC = () => {
    const { openPopup } = usePopup();

    useEffect(() => {
        if (!PUSH_MSG_ENABLED) return;

        // If the cookie already exists, the message has already been displayed, do not show again
        if (getCookie(COOKIES_KEYS.MSG_DISPLAYED)) return;

        // Mark immediately to prevent double display
        setCookie(COOKIES_KEYS.MSG_DISPLAYED, true, { expires: PUSH_MSG_EXPIRES_DAYS });

        openPopup(
            PopupAction.msgPopup,
            "M",
            <PushMsgContent message={PUSH_MSG_MESSAGE} />
        );
    }, [openPopup]);

    return null;
};

export default PushMsg;
