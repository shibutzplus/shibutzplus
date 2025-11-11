import React from "react";
import styles from "./EmptyTable.module.css";
import Icons from "@/style/icons";
import ActionBtn from "../../buttons/ActionBtn/ActionBtn";
import {
    EventColorDisabled,
    ExistingTeacherColorDisabled,
    MissingTeacherColorDisabled,
} from "@/style/colors";

const EmptyTable: React.FC = () => {
    return (
        <section className={styles.emptyTable}>
            <p className={styles.text}>יש ללחוץ על כפתורי השיבוץ כדי לעדכן מערכת יומית</p>
            <section className={styles.actions}>
                <ActionBtn
                    Icon={<Icons.addTeacher size={16} />}
                    label="שיבוץ למורה חסר"
                    isDisabled={true}
                    style={{
                        borderColor: MissingTeacherColorDisabled,
                        borderLeft: `10px solid ${MissingTeacherColorDisabled}`,
                        color: MissingTeacherColorDisabled,
                    }}
                    func={() => {}}
                />
                <ActionBtn
                    Icon={<Icons.addTeacher size={16} />}
                    label="שיבוץ למורה נוכח"
                    isDisabled={true}
                    style={{
                        borderColor: ExistingTeacherColorDisabled,
                        borderLeft: `10px solid ${ExistingTeacherColorDisabled}`,
                        color: ExistingTeacherColorDisabled,
                    }}
                    func={() => {}}
                />
                <ActionBtn
                    Icon={<Icons.event size={16} />}
                    label="שיבוץ ארוע"
                    isDisabled={true}
                    style={{
                        borderColor: EventColorDisabled,
                        borderLeft: `10px solid ${EventColorDisabled}`,
                        color: EventColorDisabled,
                    }}
                    func={() => {}}
                />
            </section>
        </section>
    );
};

export default EmptyTable;
