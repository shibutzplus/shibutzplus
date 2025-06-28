import React, { useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import styles from './dailySchedule.module.css';
import { DailyScheduleType } from '@/models/types/dailySchedule';
import { TeacherType } from '@/models/types/teachers';
import { ClassType } from '@/models/types/classes';
import { SubjectType } from '@/models/types/subjects';
import InputText from '@/components/ui/InputText/InputText';
import InputTextArea from '@/components/ui/InputTextArea/InputTextArea';
import { SelectOption } from '@/models/types';
import { useMainContext } from '@/context/MainContext';
import DynamicInputSelect from '../ui/InputSelect/DynamicInputSelect';

// Column types
type ColumnType = 'teacher' | 'info' | 'missing';

// Column interface
interface ScheduleColumn {
  id: string;
  type: ColumnType;
  title: string;
}

interface DailyScheduleTableProps {
  scheduleData: DailyScheduleType[];
  teachers: TeacherType[];
  classes: ClassType[];
  subjects: SubjectType[];
  onScheduleChange: (updatedSchedule: DailyScheduleType[]) => void;
}

// Define the ref interface
interface DailyScheduleTableRef {
  addTeacherColumn: () => void;
  addInfoColumn: () => void;
  addMissingTeacherColumn: () => void;
}

const DailyScheduleTable = forwardRef<DailyScheduleTableRef, DailyScheduleTableProps>((props, ref) => {
  const {
    scheduleData,
    teachers,
    classes,
    subjects,
    onScheduleChange
  } = props;

  // Group schedule data by hour
  const scheduleByHour = scheduleData.reduce((acc, item) => {
    const hour = item.hour;
    if (!acc[hour]) {
      acc[hour] = [];
    }
    acc[hour].push(item);
    return acc;
  }, {} as Record<number, DailyScheduleType[]>);

  // Get unique hours sorted
  const hours = Object.keys(scheduleByHour)
    .map(Number)
    .sort((a, b) => a - b);

  // Initialize with 3 columns as shown in the reference image
  const [columns, setColumns] = useState<ScheduleColumn[]>([
    {
      id: `teacher-1`,
      type: 'teacher',
      title: 'שם המורה הקיים',
    },
    {
      id: `info-1`,
      type: 'info',
      title: 'מידע',
    },
    {
      id: `missing-1`,
      type: 'missing',
      title: 'שם המורה החסר',
    },
  ]);

  // Add a new teacher column
  const addTeacherColumn = () => {
    const newColumn: ScheduleColumn = {
      id: `teacher-${Date.now()}`,
      type: 'teacher',
      title: 'שם המורה הקיים',
    };
    setColumns([...columns, newColumn]);
  };

  // Add a new info column
  const addInfoColumn = () => {
    const newColumn: ScheduleColumn = {
      id: `info-${Date.now()}`,
      type: 'info',
      title: 'מידע',
    };
    setColumns([...columns, newColumn]);
  };
  
  // Add a new missing teacher column
  const addMissingTeacherColumn = () => {
    const newColumn: ScheduleColumn = {
      id: `missing-${Date.now()}`,
      type: 'missing',
      title: 'שם המורה החסר',
    };
    setColumns([...columns, newColumn]);
  };
  
  // Expose methods to parent component via ref
  useImperativeHandle(ref, () => ({
    addTeacherColumn,
    addInfoColumn,
    addMissingTeacherColumn
  }));

  // Update column title
  const updateColumnTitle = (columnId: string, title: string) => {
    const updatedColumns = columns.map(col => 
      col.id === columnId ? { ...col, title } : col
    );
    setColumns(updatedColumns);
  };

  // Get context functions for updating schedule data
  const { updateExistingDailyScheduleItem, addNewDailyScheduleItem } = useMainContext();

  // Find existing schedule item for a specific hour and column type
  const findScheduleItem = useCallback((hour: number, columnType: ColumnType) => {
    if (!scheduleData) return null;
    
    return scheduleData.find(item => 
      item.hour === hour && 
      ((columnType === 'teacher' && item.presentTeacher?.id) ||
       (columnType === 'missing' && item.absentTeacher?.id) ||
       (columnType === 'info' && item.event))
    );
  }, [scheduleData]);

  // Handle input change in cells
  const handleCellChange = async (hour: number, columnId: string, field: string, value: string | null) => {
    // const columnType = columns.find(col => col.id === columnId)?.type;
    // if (!columnType) return;
    
    // // Find existing schedule item for this hour and column type
    // const existingItem = findScheduleItem(hour, columnType);
    
    // // If item exists, update it
    // if (existingItem) {
    //   const updatedItem: DailyScheduleRequest = {
    //     ...existingItem,
    //     [field]: value,
    //     date: "date"
    //   };
      
    //   try {
    //     const success = await updateExistingDailyScheduleItem(existingItem.id, updatedItem);
    //     if (success) {
    //       toast.success('מידע עודכן בהצלחה');
    //     } else {
    //       toast.error('שגיאה בעדכון המידע');
    //     }
    //   } catch (error) {
    //     console.error('Error updating schedule item:', error);
    //     toast.error('שגיאה בעדכון המידע');
    //   }
    // } 
    // // Otherwise create a new item
    // else {
    //   const newItem: DailyScheduleRequest = {
    //     date: "date",
    //     hour: hour,
    //     school: scheduleData[0]?.school || '',
    //     class: '',
    //     subject: '',
    //     presentTeacher: '',
    //     absentTeacher: '',
    //     subTeacher: '',
    //     [field]: value
    //   };
      
    //   try {
    //     const success = await addNewDailyScheduleItem(newItem);
    //     if (success) {
    //       toast.success('מידע נוסף בהצלחה');
    //     } else {
    //       toast.error('שגיאה בהוספת המידע');
    //     }
    //   } catch (error) {
    //     console.error('Error adding schedule item:', error);
    //     toast.error('שגיאה בהוספת המידע');
    //   }
    // }
  };

  // Map hour numbers to display format
  const hoursOfDay = ["8:00", "9:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];
  
  // Generate hours from 0 to 8 to match the reference image
  const displayHours = Array.from({ length: 9 }, (_, i) => i);

  return (
    <div className={styles.tableContainer}>
      <table className={styles.scheduleTable}>
        <thead>
          <tr>
            <th className={styles.hourCell}>שעה</th>
            {columns.map(column => (
              <th 
                key={column.id}
                className={styles[`${column.type}ColumnHeader`]}
              >
                <InputText
                  value={column.title}
                  onChange={(e) => updateColumnTitle(column.id, e.target.value)}
                  className="text-center font-bold"
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayHours.length > 0 ? displayHours.map(hour => (
            <tr key={hour}>
              <td className={styles.hourCell}>{hoursOfDay[hour]}</td>
              {columns.map(column => (
                <td 
                  key={`${hour}-${column.id}`}
                  className={`${styles.dataCell} ${styles[`${column.type}Cell`]}`}
                >
                  {column.type === 'teacher' && (
                    <>
                      <div className={styles.cellInputContainer}>
                        <DynamicInputSelect
                          label="כיתה"
                          options={classes.map(cls => ({ value: cls.id, label: cls.name }))}
                          value={findScheduleItem(hour, 'teacher')?.class?.id || ''}
                          onChange={(value: string) => handleCellChange(hour, column.id, 'classId', value)}
                          placeholder="בחר כיתה"
                          isSearchable={true}
                          isClearable={true}
                        />
                      </div>
                      <div className={styles.cellInputContainer}>
                        <DynamicInputSelect
                          label="מקצוע"
                          options={subjects.map(subject => ({ value: subject.id, label: subject.name }))}
                          value={findScheduleItem(hour, 'teacher')?.subject?.id || ''}
                          onChange={(value: string) => handleCellChange(hour, column.id, 'subjectId', value)}
                          placeholder="בחר מקצוע"
                          isSearchable={true}
                          isClearable={true}
                        />
                      </div>
                      <div className={styles.cellInputContainer}>
                        <DynamicInputSelect
                          label="מורה"
                          options={teachers.map(teacher => ({ value: teacher.id, label: teacher.name }))}
                          value={findScheduleItem(hour, 'teacher')?.presentTeacher?.id || ''}
                          onChange={(value: string) => handleCellChange(hour, column.id, 'presentTeacherId', value)}
                          placeholder="בחר מורה"
                          isSearchable={true}
                          isClearable={true}
                        />
                      </div>
                    </>
                  )}
                  {column.type === 'missing' && (
                    <>
                      <div className={styles.cellInputContainer}>
                        <DynamicInputSelect
                          label="כיתה"
                          options={classes.map(cls => ({ value: cls.id, label: cls.name }))}
                          value={findScheduleItem(hour, 'missing')?.class?.id || ''}
                          onChange={(value: string) => handleCellChange(hour, column.id, 'classId', value)}
                          placeholder="בחר כיתה"
                          isSearchable={true}
                          isClearable={true}
                        />
                      </div>
                      <div className={styles.cellInputContainer}>
                        <DynamicInputSelect
                          label="מקצוע"
                          options={subjects.map(subject => ({ value: subject.id, label: subject.name }))}
                          value={findScheduleItem(hour, 'missing')?.subject?.id || ''}
                          onChange={(value: string) => handleCellChange(hour, column.id, 'subjectId', value)}
                          placeholder="בחר מקצוע"
                          isSearchable={true}
                          isClearable={true}
                        />
                      </div>
                      <div className={styles.cellInputContainer}>
                        <DynamicInputSelect
                          label="מורה חסר"
                          options={teachers.map(teacher => ({ value: teacher.id, label: teacher.name }))}
                          value={findScheduleItem(hour, 'missing')?.absentTeacher?.id || ''}
                          onChange={(value: string) => handleCellChange(hour, column.id, 'absentTeacherId', value)}
                          placeholder="בחר מורה חסר"
                          isSearchable={true}
                          isClearable={true}
                        />
                      </div>
                      <div className={styles.cellInputContainer}>
                        <DynamicInputSelect
                          label="מורה מחליף"
                          options={teachers.map(teacher => ({ value: teacher.id, label: teacher.name }))}
                          value={findScheduleItem(hour, 'missing')?.subTeacher?.id || ''}
                          onChange={(value: string) => handleCellChange(hour, column.id, 'subTeacherId', value)}
                          placeholder="בחר מורה מחליף"
                          isSearchable={true}
                          isClearable={true}
                        />
                      </div>
                    </>
                  )}
                  {column.type === 'info' && (
                    <div>
                      <div className={styles.cellInputContainer}>
                        <InputText
                          label="כותרת אירוע"
                          value={findScheduleItem(hour, 'info')?.eventTitle || ''}
                          onChange={(e) => handleCellChange(hour, column.id, 'eventTitle', e.target.value)}
                          placeholder="כותרת האירוע"
                        />
                      </div>
                      <div className={styles.cellInputContainer}>
                        <InputTextArea
                          label="מידע אירוע"
                          value={findScheduleItem(hour, 'info')?.event || ''}
                          onChange={(e) => handleCellChange(hour, column.id, 'event', e.target.value)}
                          placeholder="רשום כאן את מה שמתרחש באירוע"
                          className={styles.cellTextArea}
                          rows={4}
                        />
                      </div>
                    </div>
                  )}
                </td>
              ))}
            </tr>
          )) : (
            <tr>
              <td colSpan={columns.length + 1} className="text-center py-8">
                אין נתונים זמינים לשעות אלו
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
});

export default DailyScheduleTable;
