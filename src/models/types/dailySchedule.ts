export type DailySchedule = {
  id: string;
  date: Date;
  hour: number; // period number
  position: string; // YYYY-MM-DD + '-hour' + hour (e.g. "2025-11-04-hour2")
  eventTitle?: string;
  event?: string;
  schoolId: string;
  classId: string;
  subjectId?: string;
  absentTeacherId?: string;
  presentTeacherId?: string;
  subTeacherId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type DailyScheduleRequest = {
  date: Date | string;
  hour: number;
  position: string;
  eventTitle?: string;
  event?: string;
  schoolId: string;
  classId: string;
  subjectId?: string;
  absentTeacherId?: string;
  presentTeacherId?: string;
  subTeacherId?: string;
}
