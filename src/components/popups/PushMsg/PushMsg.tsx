"use client";

import React, { useEffect, useState } from "react";
import { usePopup } from "@/context/PopupContext";
import MsgPopup from "@/components/popups/MsgPopup/MsgPopup";
import ContactUs from "@/components/faq/ContactUs/ContactUs";
import { sendAdminContactEmail } from "@/app/actions/POST/sendEmailAction";
import { successToast } from "@/lib/toast";
import { useOptionalMainContext } from "@/context/MainContext";
import { useSession } from "next-auth/react";
import { getStorageTeacher } from "@/lib/localStorage";
import { getSchoolAction } from "@/app/actions/GET/getSchoolAction";
import styles from "./PushMsg.module.css";

interface PushMsgContentProps {
    message: React.ReactNode;
}

export const PUSH_MSG_MESSAGE = (
    <div className={styles.container}>
        <div className={styles.greeting}>היי,</div>
        <div style={{ height: "10px" }} />
        <div>חשוב לנו לשמוע אתכם! נשמח לכל תובנה, מחשבה או הצעה בנוגע לשימוש שלכם במערכת.</div>
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
                    title=""
                    onSend={handleSendContact}
                />
            </div>
        </MsgPopup>
    );
};

const PushMsg: React.FC = () => {
    return null;
};

export default PushMsg;
