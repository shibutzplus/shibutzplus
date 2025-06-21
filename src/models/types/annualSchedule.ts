export type AnnualSchedule = {
  id: string;
  day: number; // 1-7 representing days of the week
  hour: number; // period within the day
  position: string; // concatenation day + '-hour' + hour (e.g. "day2-hour3")
  schoolId: string;
  classId: string;
  teacherId: string;
  subjectId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type AnnualScheduleRequest = {
  day: number;
  hour: number;
  position: number;
  schoolId: string;
  classId: string;
  teacherId: string;
  subjectId: string;
}
