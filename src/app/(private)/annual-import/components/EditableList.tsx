import React from 'react';
import styles from '../page.module.css';
import { FaCheck, FaMagic, FaDatabase, FaSearch } from 'react-icons/fa';

export interface ListItem {
    name: string;
    exists?: boolean; // Deprecated in favor of source, keeping for backward compat if needed during refactor
    source?: 'db' | 'ai' | 'both' | 'manual';
}

interface EditableListProps {
    title: string;
    items: ListItem[];
    onSave?: (items: ListItem[]) => void;
    onAddAndSave?: (newItemName: string) => Promise<void>; // New: Callback now receives the item name
    fromAI?: boolean;
}

const EditableList: React.FC<EditableListProps> = ({ title, items, onSave, onAddAndSave, fromAI = true }) => {
    const [newItem, setNewItem] = React.useState("");
    const [isAdding, setIsAdding] = React.useState(false);

    const handleAdd = async () => {
        if (newItem.trim()) {
            const trimmedItem = newItem.trim();
            const updated = [...items, { name: trimmedItem, exists: false }];
            if (onSave) onSave(updated);
            setNewItem("");

            // Auto-save to DB if callback provided
            if (onAddAndSave) {
                setIsAdding(true);
                try {
                    await onAddAndSave(trimmedItem);
                } finally {
                    setIsAdding(false);
                }
            }
        }
    };

    const handleDelete = (indexToDelete: number) => {
        const updated = items.filter((_, index) => index !== indexToDelete);
        if (onSave) onSave(updated);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAdd();
        }
    };

    return (
        <div className={styles.editableListContainer}>
            <div className={styles.editableListHeader}>
                <span className={styles.editableListTitle}>{title}</span>
                <span className={styles.badge}>{items.length}</span>
            </div>

            <div className={styles.searchContainer}>
                <div className={styles.addInputWrapper}>
                    <input
                        type="text"
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="הוסף עוד..."
                        className={styles.searchInput}
                    />
                    <button
                        onClick={handleAdd}
                        type="button"
                        className={styles.addBtn}
                        disabled={!newItem.trim() || isAdding}
                    >
                        {isAdding ? "⏳" : "+"}
                    </button>
                </div>
            </div>

            <div className={styles.editableContent}>
                {items.length === 0 ? (
                    <div className={styles.emptyState}>אין פריטים להצגה</div>
                ) : (
                    items.map((item, index) => (
                        <div key={index} className={styles.editableItem}>
                            <span className={styles.editableIndex}>{index + 1}.</span>
                            <span
                                className={styles.editableText}
                            >
                                {/* Icon Logic */}
                                <span className={styles.iconContainer}>
                                    {item.source === 'both' && <FaCheck className={styles.iconBoth} title="קיים ב-DB וזוהה גם על ידי AI" />}
                                    {item.source === 'ai' && <FaMagic className={styles.iconAi} title="זוהה על ידי AI ולא קיים עוד ב-DB" />}
                                    {item.source === 'manual' && <FaSearch className={styles.iconManual} title="נמצא בחיפוש בקוד שלנו" />}
                                    {item.source === 'db' && <FaDatabase className={styles.iconDb} title="קיים ב-DB" />}

                                    {/* Fallback for old "exists" logic if source is missing */}
                                    {!item.source && item.exists && fromAI && <span style={{ fontSize: '0.8em', marginRight: '5px' }}>(קיים)</span>}
                                </span>
                                {item.name}
                            </span>
                            {onSave && (
                                <button
                                    onClick={() => handleDelete(index)}
                                    className={styles.deleteBtn}
                                    title="מחק"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default EditableList;
