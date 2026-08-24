import React, { useState, useMemo } from 'react';
import styles from '../page.module.css';

export interface ListItem {
    name: string;
    exists?: boolean;
    source?: 'db' | 'ai' | 'both' | 'manual' | 'file';
}

interface EditableListProps {
    title: string;
    items: ListItem[];
    onSave?: (items: ListItem[]) => void;
    onAddAndSave?: (newItemName: string) => Promise<void>;
    onMerge?: (discardedName: string, keptName: string) => void;
    allowMerge?: boolean;
    allowSwap?: boolean;
    onSwapName?: (oldName: string, newName: string) => void;
}

export function normalizeWordStem(word: string): string {
    if (!word) return "";
    let w = word.replace(/['"״׳\u05F4\u05F3\u201C\u201D\u2018\u2019]/g, "").trim();
    // Strip trailing Hebrew grammatical endings: ים, ות, י, ת, ה
    w = w.replace(/(ים|ות|י|ת|ה)$/, "");
    return w;
}

export function areSimilarEntities(a: string, b: string): boolean {
    if (a === b) return false;
    const cleanA = a.replace(/['"״׳\u05F4\u05F3\u201C\u201D\u2018\u2019]/g, "").replace(/\s+/g, " ").trim();
    const cleanB = b.replace(/['"״׳\u05F4\u05F3\u201C\u201D\u2018\u2019]/g, "").replace(/\s+/g, " ").trim();

    if (!cleanA || !cleanB) return false;
    if (cleanA === cleanB) return true;

    const wordsA = cleanA.split(" ").filter(Boolean);
    const wordsB = cleanB.split(" ").filter(Boolean);

    // Single-word comparison (e.g. "מתמטיק" vs "מתמטיקה", "אסטרטגיה" vs "אסטרטגיות")
    if (wordsA.length === 1 && wordsB.length === 1) {
        const wA = wordsA[0];
        const wB = wordsB[0];
        const stemA = normalizeWordStem(wA);
        const stemB = normalizeWordStem(wB);
        if (stemA && stemB) {
            if (stemA === stemB) return true;
            if ((stemA.startsWith(stemB) || stemB.startsWith(stemA)) && Math.min(stemA.length, stemB.length) >= 3 && Math.abs(stemA.length - stemB.length) <= 2) return true;
        }
        if ((wA.startsWith(wB) || wB.startsWith(wA)) && Math.min(wA.length, wB.length) >= 4 && Math.abs(wA.length - wB.length) <= 2) {
            return true;
        }
        return false;
    }

    // Multi-word comparison with same word count (e.g. "כישור חיים" vs "כישורי חיי", "מוביל בתנוע" vs "מובילים בתנועה")
    if (wordsA.length === wordsB.length && wordsA.length >= 2) {
        const match = wordsA.every((wA, idx) => {
            const wB = wordsB[idx];
            if (wA === wB) return true;
            const stemA = normalizeWordStem(wA);
            const stemB = normalizeWordStem(wB);
            if (stemA && stemB) {
                if (stemA === stemB) return true;
                if ((stemA.startsWith(stemB) || stemB.startsWith(stemA)) && Math.min(stemA.length, stemB.length) >= 3 && Math.abs(stemA.length - stemB.length) <= 2) return true;
            }
            if ((wA.startsWith(wB) || wB.startsWith(wA)) && Math.min(wA.length, wB.length) >= 3 && Math.abs(wA.length - wB.length) <= 2) return true;
            return false;
        });
        if (match) return true;
    }

    return false;
}

const EditableList: React.FC<EditableListProps> = ({
    title,
    items,
    onSave,
    onAddAndSave,
    onMerge,
    allowMerge = false,
    allowSwap = false,
    onSwapName
}) => {
    const [newItem, setNewItem] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [dismissedPairs, setDismissedPairs] = useState<Set<string>>(new Set());
    const [activeMergeIndex, setActiveMergeIndex] = useState<number | null>(null);
    const [selectedTargetName, setSelectedTargetName] = useState<string>("");

    const handleSingleSwap = (index: number) => {
        const item = items[index];
        if (!item) return;
        const parts = item.name.trim().split(/\s+/);
        if (parts.length < 2) return;
        const newName = parts.slice().reverse().join(" ");

        const newItems = items.map((it, idx) => {
            if (idx === index) {
                return {
                    ...it,
                    name: newName,
                    source: 'file' as ListItem['source'],
                };
            }
            return it;
        });

        onSave?.(newItems);
        onSwapName?.(item.name, newName);
    };

    const handleBulkSwap = () => {
        const newItems = items.map(it => {
            const parts = it.name.trim().split(/\s+/);
            if (parts.length < 2) return it;
            const newName = parts.slice().reverse().join(" ");
            onSwapName?.(it.name, newName);
            return {
                ...it,
                name: newName,
                source: 'file' as ListItem['source'],
            };
        });
        onSave?.(newItems);
    };

    // Find similar pairs
    const similarPairs = useMemo(() => {
        if (!allowMerge) return [];
        const pairs: { key: string; itemA: ListItem; itemB: ListItem }[] = [];
        const seen = new Set<string>();

        for (let i = 0; i < items.length; i++) {
            for (let j = i + 1; j < items.length; j++) {
                const itemA = items[i];
                const itemB = items[j];
                const key = [itemA.name, itemB.name].sort().join("<->");

                // If one of the items is already established in DB ('both' or 'db'), skip banner prompt
                const hasDbItem = (itemA.source === 'both' || itemA.source === 'db') || (itemB.source === 'both' || itemB.source === 'db');
                if (hasDbItem) continue;

                if (!seen.has(key) && !dismissedPairs.has(key)) {
                    if (areSimilarEntities(itemA.name, itemB.name)) {
                        seen.add(key);
                        // Place the cleaner/longer or quoted item first
                        const aHasQuote = itemA.name.includes('"') || itemA.name.includes("'");
                        const bHasQuote = itemB.name.includes('"') || itemB.name.includes("'");
                        if (bHasQuote && !aHasQuote) {
                            pairs.push({ key, itemA: itemB, itemB: itemA });
                        } else if (itemB.name.length > itemA.name.length && !aHasQuote) {
                            pairs.push({ key, itemA: itemB, itemB: itemA });
                        } else {
                            pairs.push({ key, itemA, itemB });
                        }
                    }
                }
            }
        }
        return pairs;
    }, [items, dismissedPairs, allowMerge]);

    const executeMerge = (discardedName: string, keptName: string) => {
        const discardedItem = items.find(i => i.name === discardedName);
        const keptItem = items.find(i => i.name === keptName);

        let finalSource: ListItem['source'] = keptItem?.source || 'both';
        if (discardedItem && keptItem) {
            if ((discardedItem.source === 'db' && keptItem.source === 'file') ||
                (discardedItem.source === 'file' && keptItem.source === 'db')) {
                finalSource = 'both';
            }
        }

        const updated = items
            .filter(i => i.name !== discardedName)
            .map(i => i.name === keptName ? { ...i, source: finalSource } : i);

        if (onSave) onSave(updated);
        if (onMerge) onMerge(discardedName, keptName);

        setActiveMergeIndex(null);
        setSelectedTargetName("");
    };

    const handleAdd = async () => {
        if (newItem.trim()) {
            const trimmedItem = newItem.trim();
            const updated = [...items, { name: trimmedItem, exists: false, source: 'file' as const }];
            if (onSave) onSave(updated);
            setNewItem("");

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

            {/* Smart Merge Suggestions */}
            {similarPairs.length > 0 && (
                <div className={styles.mergeBanner}>
                    <div className={styles.mergeBannerText}>
                        💡 <strong>הצעת איחוד כפילות:</strong> זוהו מקצועות בעלי שם דומה:
                    </div>
                    {similarPairs.map((pair) => (
                        <div key={pair.key} style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderBottom: '1px dashed #bfdbfe', paddingBottom: '8px' }}>
                            <div style={{ fontSize: '0.85rem' }}>
                                <span className={styles.mergeHighlight}>{pair.itemA.name}</span>
                                <span style={{ margin: '0 6px', color: '#64748b' }}>⟷</span>
                                <span className={styles.mergeHighlight}>{pair.itemB.name}</span>
                            </div>
                            <div className={styles.mergeBannerActions}>
                                <button
                                    type="button"
                                    onClick={() => executeMerge(pair.itemB.name, pair.itemA.name)}
                                    className={styles.mergeBtn}
                                >
                                    אחד לשם &quot;{pair.itemA.name}&quot;
                                </button>
                                <button
                                    type="button"
                                    onClick={() => executeMerge(pair.itemA.name, pair.itemB.name)}
                                    className={styles.mergeBtn}
                                    style={{ backgroundColor: '#0284c7' }}
                                >
                                    אחד לשם &quot;{pair.itemB.name}&quot;
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDismissedPairs(prev => new Set([...prev, pair.key]))}
                                    className={styles.mergeDismissBtn}
                                >
                                    השאר נפרדים ✕
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className={styles.editableContent}>
                {items.length === 0 ? (
                    <div className={styles.emptyState}>אין פריטים להצגה</div>
                ) : (
                    items.map((item, index) => (
                        <React.Fragment key={item.name + index}>
                            <div className={styles.editableItem}>
                                <span className={styles.editableIndex}>{index + 1}.</span>
                                <span className={styles.editableText}>
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

                                <div className={styles.actionBtnGroup}>
                                    {allowSwap && item.name.trim().split(/\s+/).length >= 2 && (
                                        <button
                                            type="button"
                                            onClick={() => handleSingleSwap(index)}
                                            className={styles.rowSwapBtn}
                                            title="החלף סדר שם פרטי ומשפחה (⇄)"
                                        >
                                            ⇄
                                        </button>
                                    )}
                                    {allowMerge && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (activeMergeIndex === index) {
                                                    setActiveMergeIndex(null);
                                                } else {
                                                    setActiveMergeIndex(index);
                                                    setSelectedTargetName("");
                                                }
                                            }}
                                            className={styles.rowMergeBtn}
                                            title="אחד עם פריט אחר"
                                        >
                                            🔗
                                        </button>
                                    )}
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
                            </div>

                            {/* Inline Manual Merge Box */}
                            {activeMergeIndex === index && (
                                <div className={styles.inlineMergeBox}>
                                    <span>איחוד <strong>{item.name}</strong> עם:</span>
                                    <select
                                        value={selectedTargetName}
                                        onChange={(e) => setSelectedTargetName(e.target.value)}
                                        className={styles.inlineMergeSelect}
                                    >
                                        <option value="">בחר מקצוע...</option>
                                        {items
                                            .filter((_, idx) => idx !== index)
                                            .map(other => (
                                                <option key={other.name} value={other.name}>{other.name}</option>
                                            ))
                                        }
                                    </select>
                                    {selectedTargetName && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => executeMerge(item.name, selectedTargetName)}
                                                className={styles.mergeBtn}
                                            >
                                                אחד לשם &quot;{selectedTargetName}&quot;
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => executeMerge(selectedTargetName, item.name)}
                                                className={styles.mergeBtn}
                                                style={{ backgroundColor: '#0284c7' }}
                                            >
                                                אחד לשם &quot;{item.name}&quot;
                                            </button>
                                        </>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setActiveMergeIndex(null)}
                                        className={styles.mergeDismissBtn}
                                    >
                                        ביטול
                                    </button>
                                </div>
                            )}
                        </React.Fragment>
                    ))
                )}
            </div>

            {/* Bulk Name Swap Button (Teachers Only) */}
            {allowSwap && items.some(i => i.name.trim().split(/\s+/).length >= 2) && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.4rem', paddingTop: '0.4rem', paddingBottom: '0.4rem', borderTop: '1px solid #f1f5f9' }}>
                    <button
                        type="button"
                        onClick={handleBulkSwap}
                        className={styles.bulkSwapBtn}
                        title="הפוך סדר שם משפחה ושם פרטי לכל המורים ברשימה"
                    >
                        <span>⇄</span> הפוך סדר כל השמות (משפחה ⇄ פרטי)
                    </button>
                </div>
            )}
        </div>
    );
};

export default EditableList;
