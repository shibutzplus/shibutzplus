import React from "react";
import styles from "./EmptyTable.module.css";
import Icons from "@/style/icons";
import ActionBtn from "../../ui/buttons/ActionBtn/ActionBtn";
import { EventColor, ExistingTeacherColor, MissingTeacherColor } from "@/style/root";

type EmptyTableProps = {
    message?: string;
    showIcons?: boolean;
};

const EmptyTable: React.FC<EmptyTableProps> = ({
    message = "יש ללחוץ על כפתורי השיבוץ בתפריט העליון כדי לעדכן את המערכת היומית",
    showIcons = true,
}) => {
    return (
        <section className={styles.emptyTable}>
            <p className={styles.text}>
                <span className={styles.desktopText}>{message}</span>
                <span className={styles.mobileText}>לחצו על הוספה ושיבוץ כדי לעדכן את המערכת היומית</span>
            </p>
            {showIcons && (
                <section className={styles.actions}>
                    <ActionBtn
                        Icon={<Icons.missingTeacher size={14} />}
                        label="שיבוץ למורה חסר"
                        isDisabled={true}
                        style={{
                            borderColor: MissingTeacherColor,
                            borderLeft: `10px solid ${MissingTeacherColor}`,
                            color: MissingTeacherColor,
                            opacity: 0.3,
                        }}
                        func={() => { }}
                    />
                    <ActionBtn
                        Icon={<Icons.teacher size={14} />}
                        label="שיבוץ למורה נוכח"
                        isDisabled={true}
                        style={{
                            borderColor: ExistingTeacherColor,
                            borderLeft: `10px solid ${ExistingTeacherColor}`,
                            color: ExistingTeacherColor,
                            opacity: 0.3,
                        }}
                        func={() => { }}
                    />
                    <ActionBtn
                        Icon={<Icons.event size={16} />}
                        label="שיבוץ ארוע"
                        isDisabled={true}
                        style={{
                            borderColor: EventColor,
                            borderLeft: `10px solid ${EventColor}`,
                            color: EventColor,
                            opacity: 0.3,
                        }}
                        func={() => { }}
                    />
                </section>
            )}
        </section>
    );
};

export default EmptyTable;
