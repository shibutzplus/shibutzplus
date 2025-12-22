import { relations } from 'drizzle-orm';

// Import schema definitions
import { users, type UserSchema, type NewUserSchema } from './users';
import { type UserRole, type UserGender } from '@/models/types/auth';
import { schools, type SchoolSchema, type NewSchoolSchema } from './schools';
import { type SchoolLevel, type SchoolStatus } from '@/models/types/school';
import { teachers, type TeacherSchema, type NewTeacherSchema } from './teachers';
import { type TeacherRole } from '@/models/types/teachers';
import { classes, type ClassSchema, type NewClassSchema } from './classes';
import { subjects, type SubjectSchema, type NewSubjectSchema } from './subjects';
import { annualSchedule, type AnnualScheduleSchema, type NewAnnualScheduleSchema } from './annual-schedule';
import { dailySchedule, type DailyScheduleSchema, type NewDailyScheduleSchema } from './daily-schedule';


// ===== Define Relations =====

// User relations
export const usersRelations = relations(users, ({ one }) => ({
  school: one(schools, {
    fields: [users.schoolId],
    references: [schools.id],
  }),
}));

// School relations
export const schoolsRelations = relations(schools, ({ many }) => ({
  users: many(users),
  teachers: many(teachers),
  classes: many(classes),
  subjects: many(subjects),
  annualSchedules: many(annualSchedule),
  dailySchedules: many(dailySchedule),

}));

// School Settings relations


// Teacher relations
export const teachersRelations = relations(teachers, ({ one, many }) => ({
  school: one(schools, {
    fields: [teachers.schoolId],
    references: [schools.id],
  }),
  user: one(users, {
    fields: [teachers.userId],
    references: [users.id],
  }),
  taughtAnnualSchedules: many(annualSchedule),
  issueSchedules: many(dailySchedule, { relationName: 'issueTeacher' }),
  subSchedules: many(dailySchedule, { relationName: 'subTeacher' }),
}));

// Class relations
export const classesRelations = relations(classes, ({ one, many }) => ({
  school: one(schools, {
    fields: [classes.schoolId],
    references: [schools.id],
  }),
  annualSchedules: many(annualSchedule),
  dailySchedules: many(dailySchedule),
}));

// Subject relations
export const subjectsRelations = relations(subjects, ({ one, many }) => ({
  school: one(schools, {
    fields: [subjects.schoolId],
    references: [schools.id],
  }),
  annualSchedules: many(annualSchedule),
  dailySchedules: many(dailySchedule),
}));

// Annual Schedule relations
export const annualScheduleRelations = relations(annualSchedule, ({ one }) => ({
  school: one(schools, {
    fields: [annualSchedule.schoolId],
    references: [schools.id],
  }),
  class: one(classes, {
    fields: [annualSchedule.classId],
    references: [classes.id],
  }),
  teacher: one(teachers, {
    fields: [annualSchedule.teacherId],
    references: [teachers.id],
  }),
  subject: one(subjects, {
    fields: [annualSchedule.subjectId],
    references: [subjects.id],
  }),
}));

// Daily Schedule relations
export const dailyScheduleRelations = relations(dailySchedule, ({ one }) => ({
  school: one(schools, {
    fields: [dailySchedule.schoolId],
    references: [schools.id],
  }),
  class: one(classes, {
    fields: [dailySchedule.classId],
    references: [classes.id],
  }),
  subject: one(subjects, {
    fields: [dailySchedule.subjectId],
    references: [subjects.id],
    relationName: 'subject',
  }),
  subTeacher: one(teachers, {
    fields: [dailySchedule.subTeacherId],
    references: [teachers.id],
    relationName: 'subTeacher',
  }),
  issueTeacher: one(teachers, {
    fields: [dailySchedule.issueTeacherId],
    references: [teachers.id],
    relationName: 'issueTeacher',
  }),
}));

// Export all tables and types
export {
  users, type UserRole, type UserGender, type UserSchema, type NewUserSchema,
  schools, type SchoolLevel, type SchoolStatus, type SchoolSchema, type NewSchoolSchema,
  teachers, type TeacherRole, type TeacherSchema, type NewTeacherSchema,
  classes, type ClassSchema, type NewClassSchema,
  subjects, type SubjectSchema, type NewSubjectSchema,
  annualSchedule, type AnnualScheduleSchema, type NewAnnualScheduleSchema,
  dailySchedule, type DailyScheduleSchema, type NewDailyScheduleSchema,
};

// Export all tables for Drizzle ORM
export const tables = {
  users,
  schools,
  teachers,
  classes,
  subjects,
  annualSchedule,
  dailySchedule,
};
