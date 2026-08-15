import React from 'react';
import styles from '../page.module.css';

export interface ListItem {
    name: string;
    exists?: boolean; // Deprecated in favor of source, keeping for backward compat if needed during refactor
    source?: 'db' | 'ai' | 'both' | 'manual' | 'file';
}

interface EditableListProps {
    title: string;
    items: ListItem[];
    onSave?: (items: ListItem[]) => void;
    onAddAndSave?: (newItemName: string) => Promise<void>; // New: Callback now receives the item name
    fromAI?: boolean;
}

const EditableList: React.FC<EditableListProps> = ({ title, items, onSave, onAddAndSave }) => {
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
                                {item.name}
                                {item.source === 'file' && (
                                    <span style={{ fontSize: '0.85em', color: '#d97706', marginRight: '8px', fontWeight: 500 }}>
                                        (חדש)
                                    </span>
                                )}
                                {item.source === 'both' && (
                                    <span style={{ fontSize: '0.85em', color: '#16a34a', marginRight: '8px', fontWeight: 500 }}>
                                        (ממשיך)
                                    </span>
                                )}
                                {item.source === 'db' && (
                                    <span style={{ fontSize: '0.85em', color: '#6b7280', marginRight: '8px', fontStyle: 'italic' }}>
                                        (לא ממשיך)
                                    </span>
                                )}
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
