import React from "react";
import styles from "./ContactAdminError.module.css";

const ContactAdminError: React.FC = () => {
    return (
        <div className={styles.container}>
            <div className={styles.message}>
                נראה שיש שגיאה בקישור.
                <br />
                לקבלת הקישור הנכון, אנא פנו להנהלת בית הספר.
            </div>
            <footer className={styles.footer}>
                &copy; שיבוץ+, כל הזכויות שמורות. 2025
            </footer>
        </div>
    );
};

export default ContactAdminError;
