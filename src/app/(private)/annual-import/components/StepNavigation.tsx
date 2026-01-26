import React from 'react';
import styles from '../page.module.css';
import Icons from '@/style/icons';

interface StepNavigationProps {
    onNext?: () => void;
    onPrev?: () => void;
    onRefresh?: () => void;
    isNextDisabled?: boolean;
    isPrevDisabled?: boolean;
    isRefreshing?: boolean;
    isLoading?: boolean;
    nextLabel?: string;
    prevLabel?: string;
    showPrev?: boolean;
    onSaveToDB?: () => void;
    isSaving?: boolean;
}

const StepNavigation: React.FC<StepNavigationProps> = ({
    onNext,
    onPrev,
    onRefresh,
    onSaveToDB,
    isNextDisabled = false,
    isPrevDisabled = false,
    isRefreshing = false,
    isLoading = false,
    isSaving = false,
    nextLabel = "הבא",
    prevLabel = "הקודם",
    showPrev = true
}) => {
    return (
        <div className={styles.actions} style={{ justifyContent: 'space-between' }}>
            {onRefresh && (
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        type="button"
                        onClick={onRefresh}
                        disabled={isRefreshing}
                        className={styles.btnRefresh}
                        title="שלוף מחדש בעזרת AI"
                    >
                        {isRefreshing ? "⏳" : (
                            <Icons.magic size={24} />
                        )}
                    </button>
                    {onSaveToDB && (
                        <button
                            type="button"
                            onClick={onSaveToDB}
                            disabled={isSaving}
                            className={styles.btnRefresh} // Reusing same style for icon button
                            title="שמור שינויים למסד הנתונים"
                        >
                            {isSaving ? "⏳" : (
                                <Icons.save size={24} />
                            )}
                        </button>
                    )}
                </div>
            )}
            <div style={{ display: 'flex', gap: '10px' }}>
                {showPrev && onPrev && (
                    <button
                        type="button"
                        onClick={onPrev}
                        disabled={isPrevDisabled || isRefreshing || isLoading}
                        className={styles.modalBtnNo}
                    >
                        {prevLabel}
                    </button>
                )}
                {onNext && (
                    <button
                        type="button"
                        onClick={onNext}
                        disabled={isNextDisabled || isRefreshing || isLoading}
                        className={styles.btnPrimary}
                    >
                        {isLoading ? "מעבד..." : nextLabel}
                    </button>
                )}
            </div>
        </div>
    );
};

export default StepNavigation;
