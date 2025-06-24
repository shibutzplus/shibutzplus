import { db, schema } from "./index";
import { eq, and, or, desc, asc, sql, count } from "drizzle-orm";
import {
    NewUserSchema,
    NewSchoolSchema,
    NewTeacherSchema,
    NewClassSchema,
    NewSubjectSchema,
    NewAnnualScheduleSchema,
    NewDailyScheduleSchema,
    TeacherRole,
} from "./schema";
import { AnnualScheduleType } from "@/models/types/annualSchedule";

//TODO: move to the actions

// User operations
export async function getUserById(id: string) {
    return (await db.select().from(schema.users).where(eq(schema.users.id, id)))[0];
}

export async function getUserByEmail(email: string) {
    return (await db.select().from(schema.users).where(eq(schema.users.email, email)))[0];
}

export async function createUser(user: NewUserSchema) {
    return (await db.insert(schema.users).values(user).returning())[0];
}

export async function updateUser(id: string, user: Partial<NewUserSchema>) {
    return (await db.update(schema.users).set(user).where(eq(schema.users.id, id)).returning())[0];
}

export async function deleteUser(id: string) {
    return (await db.delete(schema.users).where(eq(schema.users.id, id)).returning())[0];
}

export async function getUserWithSchool(id: string) {
    return await db.query.users.findFirst({
        where: eq(schema.users.id, id),
        with: {
            school: true,
        },
    });
}

// School operations
export async function getSchoolById(id: string) {
    return (await db.select().from(schema.schools).where(eq(schema.schools.id, id)))[0];
}

export async function getAllSchools() {
    return await db.select().from(schema.schools);
}

export async function getSchoolsByStatus(status: schema.SchoolStatus) {
    return await db.select().from(schema.schools).where(eq(schema.schools.status, status));
}

export async function createSchool(school: NewSchoolSchema) {
    return (await db.insert(schema.schools).values(school).returning())[0];
}

export async function updateSchool(id: string, school: Partial<NewSchoolSchema>) {
    return (
        await db.update(schema.schools).set(school).where(eq(schema.schools.id, id)).returning()
    )[0];
}

export async function deleteSchool(id: string) {
    return (await db.delete(schema.schools).where(eq(schema.schools.id, id)).returning())[0];
}

export async function getSchoolWithUsers(id: string) {
    return await db.query.schools.findFirst({
        where: eq(schema.schools.id, id),
        with: {
            users: true,
        },
    });
}

export async function getSchoolWithTeachers(id: string) {
    return await db.query.schools.findFirst({
        where: eq(schema.schools.id, id),
        with: {
            teachers: true,
        },
    });
}

export async function getSchoolWithClasses(id: string) {
    return await db.query.schools.findFirst({
        where: eq(schema.schools.id, id),
        with: {
            classes: true,
        },
    });
}

export async function getSchoolWithSubjects(id: string) {
    return await db.query.schools.findFirst({
        where: eq(schema.schools.id, id),
        with: {
            subjects: true,
        },
    });
}

// Teacher operations
export async function getTeacherById(id: string) {
    return (await db.select().from(schema.teachers).where(eq(schema.teachers.id, id)))[0];
}

export async function getAllTeachers() {
    return await db.select().from(schema.teachers);
}

export async function getTeachersBySchool(schoolId: string) {
    return await db.select().from(schema.teachers).where(eq(schema.teachers.schoolId, schoolId));
}

export async function getTeachersByRole(role: TeacherRole) {
    return await db.select().from(schema.teachers).where(eq(schema.teachers.role, role));
}

export async function createTeacher(teacher: NewTeacherSchema) {
    return (await db.insert(schema.teachers).values(teacher).returning())[0];
}

export async function updateTeacher(id: string, teacher: Partial<NewTeacherSchema>) {
    return (
        await db.update(schema.teachers).set(teacher).where(eq(schema.teachers.id, id)).returning()
    )[0];
}

export async function deleteTeacher(id: string) {
    return (await db.delete(schema.teachers).where(eq(schema.teachers.id, id)).returning())[0];
}

export async function getTeacherWithUser(id: string) {
    return await db.query.teachers.findFirst({
        where: eq(schema.teachers.id, id),
        with: {
            user: true,
        },
    });
}

export async function getTeacherWithSchool(id: string) {
    return await db.query.teachers.findFirst({
        where: eq(schema.teachers.id, id),
        with: {
            school: true,
        },
    });
}

// Class operations
export async function getClassById(id: string) {
    return (await db.select().from(schema.classes).where(eq(schema.classes.id, id)))[0];
}

export async function getAllClasses() {
    return await db.select().from(schema.classes);
}

export async function getClassesBySchool(schoolId: string) {
    return await db.select().from(schema.classes).where(eq(schema.classes.schoolId, schoolId));
}

export async function createClass(classData: NewClassSchema) {
    return (await db.insert(schema.classes).values(classData).returning())[0];
}

export async function updateClass(id: string, classData: Partial<NewClassSchema>) {
    return (
        await db.update(schema.classes).set(classData).where(eq(schema.classes.id, id)).returning()
    )[0];
}

export async function deleteClass(id: string) {
    return (await db.delete(schema.classes).where(eq(schema.classes.id, id)).returning())[0];
}

export async function getClassWithSchool(id: string) {
    return await db.query.classes.findFirst({
        where: eq(schema.classes.id, id),
        with: {
            school: true,
        },
    });
}

// Subject operations
export async function getSubjectById(id: string) {
    return (await db.select().from(schema.subjects).where(eq(schema.subjects.id, id)))[0];
}

export async function getAllSubjects() {
    return await db.select().from(schema.subjects);
}

export async function getSubjectsBySchool(schoolId: string) {
    return await db.select().from(schema.subjects).where(eq(schema.subjects.schoolId, schoolId));
}

export async function createSubject(subject: NewSubjectSchema) {
    return (await db.insert(schema.subjects).values(subject).returning())[0];
}

export async function updateSubject(id: string, subject: Partial<NewSubjectSchema>) {
    return (
        await db.update(schema.subjects).set(subject).where(eq(schema.subjects.id, id)).returning()
    )[0];
}

export async function deleteSubject(id: string) {
    return (await db.delete(schema.subjects).where(eq(schema.subjects.id, id)).returning())[0];
}

export async function getSubjectWithSchool(id: string) {
    return await db.query.subjects.findFirst({
        where: eq(schema.subjects.id, id),
        with: {
            school: true,
        },
    });
}

// Annual Schedule operations
export async function getAnnualScheduleById(id: string) {
    return (
        await db.select().from(schema.annualSchedule).where(eq(schema.annualSchedule.id, id))
    )[0];
}

export async function getAnnualSchedulesBySchool(schoolId: string) {
    const schedules = await db.query.annualSchedule.findMany({
        where: eq(schema.annualSchedule.schoolId, schoolId),
        with: {
            school: true,
            class: true,
            teacher: true,
            subject: true,
        },
    });

    return schedules.map(schedule => ({
        id: schedule.id,
        day: schedule.day,
        hour: schedule.hour,
        position: schedule.position,
        school: schedule.school,
        class: schedule.class,
        teacher: schedule.teacher,
        subject: schedule.subject,
        createdAt: schedule.createdAt,
        updatedAt: schedule.updatedAt
    } as AnnualScheduleType));
}

export async function getAnnualSchedulesByClass(classId: string) {
    return await db
        .select()
        .from(schema.annualSchedule)
        .where(eq(schema.annualSchedule.classId, classId));
}

export async function getAnnualSchedulesByTeacher(teacherId: string) {
    return await db
        .select()
        .from(schema.annualSchedule)
        .where(eq(schema.annualSchedule.teacherId, teacherId));
}

export async function getAnnualSchedulesBySubject(subjectId: string) {
    return await db
        .select()
        .from(schema.annualSchedule)
        .where(eq(schema.annualSchedule.subjectId, subjectId));
}

export async function createAnnualSchedule(schedule: NewAnnualScheduleSchema) {
    return (await db.insert(schema.annualSchedule).values(schedule).returning())[0];
}

export async function updateAnnualSchedule(id: string, schedule: Partial<NewAnnualScheduleSchema>) {
    return (
        await db
            .update(schema.annualSchedule)
            .set(schedule)
            .where(eq(schema.annualSchedule.id, id))
            .returning()
    )[0];
}

export async function deleteAnnualSchedule(id: string) {
    return (
        await db.delete(schema.annualSchedule).where(eq(schema.annualSchedule.id, id)).returning()
    )[0];
}

export async function getAnnualScheduleWithRelations(id: string) {
    return await db.query.annualSchedule.findFirst({
        where: eq(schema.annualSchedule.id, id),
        with: {
            school: true,
            class: true,
            teacher: true,
            subject: true,
        },
    });
}

// Daily Schedule operations
export async function getDailyScheduleById(id: string) {
    return (await db.select().from(schema.dailySchedule).where(eq(schema.dailySchedule.id, id)))[0];
}

export async function getDailySchedulesByDate(date: string) {
    return await db.select().from(schema.dailySchedule).where(eq(schema.dailySchedule.date, date));
}

export async function getDailySchedulesBySchool(schoolId: string) {
    return await db
        .select()
        .from(schema.dailySchedule)
        .where(eq(schema.dailySchedule.schoolId, schoolId));
}

export async function getDailySchedulesByClass(classId: string) {
    return await db
        .select()
        .from(schema.dailySchedule)
        .where(eq(schema.dailySchedule.classId, classId));
}

export async function getDailySchedulesBySubject(subjectId: string) {
    return await db
        .select()
        .from(schema.dailySchedule)
        .where(eq(schema.dailySchedule.subjectId, subjectId));
}

export async function getDailySchedulesByAbsentTeacher(teacherId: string) {
    return await db
        .select()
        .from(schema.dailySchedule)
        .where(eq(schema.dailySchedule.absentTeacherId, teacherId));
}

export async function getDailySchedulesByPresentTeacher(teacherId: string) {
    return await db
        .select()
        .from(schema.dailySchedule)
        .where(eq(schema.dailySchedule.presentTeacherId, teacherId));
}

export async function getDailySchedulesBySubTeacher(teacherId: string) {
    return await db
        .select()
        .from(schema.dailySchedule)
        .where(eq(schema.dailySchedule.subTeacherId, teacherId));
}

export async function createDailySchedule(schedule: NewDailyScheduleSchema) {
    return (await db.insert(schema.dailySchedule).values(schedule).returning())[0];
}

export async function updateDailySchedule(id: string, schedule: Partial<NewDailyScheduleSchema>) {
    return (
        await db
            .update(schema.dailySchedule)
            .set(schedule)
            .where(eq(schema.dailySchedule.id, id))
            .returning()
    )[0];
}

export async function deleteDailySchedule(id: string) {
    return (
        await db.delete(schema.dailySchedule).where(eq(schema.dailySchedule.id, id)).returning()
    )[0];
}

export async function getDailyScheduleWithRelations(id: string) {
    return await db.query.dailySchedule.findFirst({
        where: eq(schema.dailySchedule.id, id),
        with: {
            school: true,
            class: true,
            subject: true,
            absentTeacher: true,
            presentTeacher: true,
            subTeacher: true,
        },
    });
}

// Advanced queries
export async function getSchoolsWithTeacherCounts() {
    const result = await db
        .select({
            school: schema.schools,
            teacherCount: count(schema.teachers.id),
        })
        .from(schema.schools)
        .leftJoin(schema.teachers, eq(schema.schools.id, schema.teachers.schoolId))
        .groupBy(schema.schools.id);

    return result;
}

// Get teachers by school and annual schedule subject
export async function getTeachersBySchoolAndSubject(schoolId: string, subjectId: string) {
    return await db
        .select()
        .from(schema.teachers)
        .innerJoin(
            schema.annualSchedule,
            and(
                eq(schema.teachers.id, schema.annualSchedule.teacherId),
                eq(schema.annualSchedule.subjectId, subjectId),
            ),
        )
        .where(eq(schema.teachers.schoolId, schoolId));
}

export async function searchTeachers(query: string) {
    return await db
        .select()
        .from(schema.teachers)
        .where(sql`${schema.teachers.id} ILIKE ${`%${query}%`}`);
}
