import '@tanstack/react-table';
import { ColumnType } from '@/models/types/dailySchedule';

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData, TValue> {
    bgColor?: string;
    type?: ColumnType;
  }
}
