import React from 'react';
import styles from './dailySchedule.module.css';
import { FaPlus } from 'react-icons/fa';

interface DailyScheduleTopButtonsProps {
  onAddTeacherColumn: () => void;
  onAddInfoColumn: () => void;
  onAddMissingTeacherColumn: () => void;
}

/**
 * Component for the top buttons in the daily schedule
 * Each button adds a new column to the schedule with specific input types and colors
 */
const DailyScheduleTopButtons: React.FC<DailyScheduleTopButtonsProps> = ({
  onAddTeacherColumn,
  onAddInfoColumn,
  onAddMissingTeacherColumn,
}) => {
  return (
    <div className={styles.topButtonsContainer}>
      <button
        className={`${styles.topButton} ${styles.teacherButton}`}
        onClick={onAddTeacherColumn}
        title="הוסף עמודת מורה קיים"
      >
        <FaPlus className={styles.buttonIcon} />
        <span>הוספת עמודת מורה קיים</span>
      </button>
      <button
        className={`${styles.topButton} ${styles.infoButton}`}
        onClick={onAddInfoColumn}
        title="הוסף עמודת מידע"
      >
        <FaPlus className={styles.buttonIcon} />
        <span>הוספת עמודת מידע</span>
      </button>
      <button
        className={`${styles.topButton} ${styles.missingButton}`}
        onClick={onAddMissingTeacherColumn}
        title="הוסף עמודת מורה חסר"
      >
        <FaPlus className={styles.buttonIcon} />
        <span>הוספת עמודת מורה חסר</span>
      </button>
    </div>
  );
};

export default DailyScheduleTopButtons;
