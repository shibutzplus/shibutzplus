import React from 'react';
import styles from '../page.module.css';
import Icons from '@/style/icons';

interface StepNavigationProps {
    onNext?: () => void;
    onPrev?: () => void;
    isNextDisabled?: boolean;
    isPrevDisabled?: boolean;
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
    onSaveToDB,
    isNextDisabled = false,
    isPrevDisabled = false,
    isLoading = false,
    isSaving = false,
    nextLabel = "הבא",
    prevLabel = "הקודם",
    showPrev = true
}) => {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: '0.5rem' }}>
            <div>
                {onSaveToDB && (
                    <button
                        type="button"
                        onClick={onSaveToDB}
                        disabled={isSaving}
                        className={styles.btnRefresh}
                        title="שמור ל DB"
                    >
                        {isSaving ? "⏳" : (
                            <Icons.save size={24} />
                        )}
                    </button>
                )}
            </div>
            <div style={{ display: 'flex', gap: '10px', marginInlineStart: 'auto' }}>
                {showPrev && onPrev && (
                    <button
                        type="button"
                        onClick={onPrev}
                        disabled={isPrevDisabled || isLoading}
                        className={styles.modalBtnNo}
                    >
                        {prevLabel}
                    </button>
                )}
                {onNext && (
                    <button
                        type="button"
                        onClick={onNext}
                        disabled={isNextDisabled || isLoading}
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
