import React from "react";
import styles from "../page.module.css";

interface EditableListProps {
    title: string;
    items: string[];
    onChange: (items: string[]) => void;
}

const EditableList: React.FC<EditableListProps> = ({ title, items, onChange }) => {
    const handleDelete = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        onChange(newItems);
    };

    const handleAdd = () => {
        onChange([...items, ""]);
    };

    return (
        <div className={`${styles.editableListContainer} ${styles.listColumn || ''}`}>
            <div className={styles.editableListHeader}>
                <h4 className={styles.editableListTitle}>{title} ({items.length})</h4>
                <button onClick={handleAdd} className={styles.editableAddButton}>+ הוסף</button>
            </div>

            <div className={styles.editableContent}>
                {items.map((item, idx) => (
                    <div key={idx} className={styles.editableItem}>
                        <span className={styles.editableIndex}>{idx + 1}.</span>
                        <input
                            value={item}
                            className={styles.editableInput}
                            onChange={(e) => {
                                const newItems = [...items];
                                newItems[idx] = e.target.value;
                                onChange(newItems);
                            }}
                            placeholder="הזן ערך..."
                        />
                        <button
                            onClick={() => handleDelete(idx)}
                            className={styles.editableDeleteButton}
                            title="מחק שורה"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                            </svg>
                        </button>
                    </div>
                ))}
                {items.length === 0 && (
                    <div className={styles.emptyState}>
                        <span>אין נתונים</span>
                        <button onClick={handleAdd} className={styles.emptyAddButton}>הוסף פריט ראשון</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EditableList;
