import React from "react";
import styles from "./NotificationPermissionRequest.module.css";
import Icons from "@/style/icons";

interface NotificationPermissionRequestProps {
    onRequestPermission: () => void;
}

const NotificationPermissionRequest: React.FC<NotificationPermissionRequestProps> = ({ onRequestPermission }) => {
    return (
        <button
            type="button"
            className={styles.permissionBtn}
            onClick={onRequestPermission}
            title="אישור קבלת התראות"
        >
            <Icons.bell size={22} />
        </button>
    );
};

export default NotificationPermissionRequest;
