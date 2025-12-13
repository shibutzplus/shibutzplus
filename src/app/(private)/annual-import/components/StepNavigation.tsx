import React from 'react';
import SubmitBtn from '@/components/ui/buttons/SubmitBtn/SubmitBtn';
import styles from '../page.module.css';

interface StepNavigationProps {
    onNext: () => void;
    onPrev?: () => void;
    nextLabel?: string;
    prevLabel?: string;
    isNextDisabled?: boolean;
    isPrevDisabled?: boolean;
    isLoading?: boolean;
    showPrev?: boolean;
    className?: string;
}

const StepNavigation: React.FC<StepNavigationProps> = ({
    onNext,
    onPrev,
    nextLabel = "שלב הבא >",
    prevLabel = "< שלב קודם",
    isNextDisabled = false,
    isPrevDisabled = false,
    isLoading = false,
    showPrev = true,
    className
}) => {
    return (
        <div className={`${styles.actions} ${className || ''}`}>
            <div className={styles.buttonsRow}>
                {showPrev && onPrev && (
                    <SubmitBtn
                        onClick={onPrev}
                        buttonText={prevLabel}
                        className={styles.btnSecondary}
                        isLoading={false}
                        type="button"
                        disabled={isPrevDisabled || isLoading}
                    />
                )}
                <SubmitBtn
                    onClick={onNext}
                    buttonText={nextLabel}
                    className={nextLabel === "סיום" ? styles.btnSuccess : styles.btnPrimary}
                    isLoading={isLoading}
                    type="button"
                    disabled={isNextDisabled}
                />
            </div>
        </div>
    );
};

export default StepNavigation;
