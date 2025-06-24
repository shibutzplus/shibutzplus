import { db, schema } from './index';
import { loadEnv } from './load-env';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { sql } from 'drizzle-orm';
import { UserRole, UserGender } from '@/models/types/auth';
import { SchoolAgeGroup, SchoolStatus } from '@/models/types/school';
import { TeacherRole } from '@/models/types/teachers';

/**
 * Seed the database with initial data
 */
async function seed() {
  // Load environment variables
  loadEnv();
  
  console.log('Seeding database...');
  
  // Create a fresh database connection
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  
  // Create a Neon connection
  const sql = neon(DATABASE_URL);
  const db = drizzle(sql, { schema });

  try {
    // Clear existing data (if needed)
    await clearExistingData(db);

    // Insert schools
    const schoolIds = await seedSchools(db);
    
    // Insert users
    const userIds = await seedUsers(db, schoolIds);
    
    // Insert teachers
    const teacherIds = await seedTeachers(db, userIds, schoolIds);
    
    // Insert classes
    const classIds = await seedClasses(db, schoolIds);
    
    // Insert subjects
    const subjectIds = await seedSubjects(db, schoolIds);
    
    // Insert annual schedule
    await seedAnnualSchedule(db, schoolIds, classIds, teacherIds, subjectIds);
    
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Seeding failed:', error);
    throw error;
  }
}

/**
 * Clear existing data from all tables
 */
async function clearExistingData(db: any) {
  console.log('Clearing existing data...');
  
  try {
    // Check if tables exist before deleting
    const tableExists = async (tableName: string) => {
      try {
        const result = await db.execute(sql`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = ${tableName}
          );
        `);
        return result[0]?.exists || false;
      } catch (error) {
        console.warn(`Error checking if table ${tableName} exists:`, error);
        return false;
      }
    };
    
    // Delete in reverse order of dependencies
    if (await tableExists('daily_schedule')) await db.delete(schema.dailySchedule);
    if (await tableExists('annual_schedule')) await db.delete(schema.annualSchedule);
    if (await tableExists('classes')) await db.delete(schema.classes);
    if (await tableExists('subjects')) await db.delete(schema.subjects);
    if (await tableExists('teachers')) await db.delete(schema.teachers);
    if (await tableExists('users')) await db.delete(schema.users);
    if (await tableExists('schools')) await db.delete(schema.schools);
    
    console.log('Existing data cleared successfully');
  } catch (error) {
    console.warn('Error while clearing data:', error);
    console.log('Continuing with seed process...');
  }
}

/**
 * Seed schools table
 */
async function seedSchools(db: any) {
  console.log('Seeding schools...');
  
  const schools = [
    {
      name: 'Elementary School 1',
      type: 'elementary' as SchoolAgeGroup,
      status: 'active' as SchoolStatus,
    },
    {
      name: 'Middle School 1',
      type: 'middle' as SchoolAgeGroup,
      status: 'active' as SchoolStatus,
    },
    {
      name: 'High School 1',
      type: 'high' as SchoolAgeGroup,
      status: 'active' as SchoolStatus,
    },
    {
      name: 'New School',
      type: 'elementary' as SchoolAgeGroup,
      status: 'onboarding' as SchoolStatus,
    },
  ];
  
  const result = await db.insert(schema.schools).values(schools).returning({ id: schema.schools.id });
  console.log(`${result.length} schools inserted`);
  
  return result.map((school: { id: string }) => school.id);
}

/**
 * Seed users table
 */
async function seedUsers(db: any, schoolIds: string[]) {
  console.log('Seeding users...');
  
  const users = [
    {
      name: 'Admin User',
      email: 'admin@example.com',
      password: '$2b$10$dQmNjz5SsxpX.Ts.Qz46t.DHvTfGDOxcZHLAY0mGmvLnOJyGd5Dja', // hashed 'password123'
      role: 'admin' as UserRole,
      gender: 'male' as UserGender,
      schoolId: schoolIds[0],
    },
    {
      name: 'John Smith',
      email: 'john@example.com',
      password: '$2b$10$dQmNjz5SsxpX.Ts.Qz46t.DHvTfGDOxcZHLAY0mGmvLnOJyGd5Dja',
      role: 'teacher' as UserRole,
      gender: 'male' as UserGender,
      schoolId: schoolIds[0],
    },
    {
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      password: '$2b$10$dQmNjz5SsxpX.Ts.Qz46t.DHvTfGDOxcZHLAY0mGmvLnOJyGd5Dja',
      role: 'teacher' as UserRole,
      gender: 'female' as UserGender,
      schoolId: schoolIds[1],
    },
    {
      name: 'Michael Brown',
      email: 'michael@example.com',
      password: '$2b$10$dQmNjz5SsxpX.Ts.Qz46t.DHvTfGDOxcZHLAY0mGmvLnOJyGd5Dja',
      role: 'teacher' as UserRole,
      gender: 'male' as UserGender,
      schoolId: schoolIds[2],
    },
  ];
  
  const result = await db.insert(schema.users).values(users).returning({ id: schema.users.id });
  console.log(`${result.length} users inserted`);
  
  return result.map((user: { id: string }) => user.id);
}

/**
 * Seed teachers table
 */
async function seedTeachers(db: any, userIds: string[], schoolIds: string[]) {
  console.log('Seeding teachers...');
  
  // Get user information to use for teacher names
  const users = await db.select().from(schema.users).where(
    sql`id IN (${sql.join(userIds, sql`, `)})`
  );
  
  const userMap = users.reduce((map: any, user: any) => {
    map[user.id] = user;
    return map;
  }, {});
  
  const teachers = [
    {
      role: 'homeroom' as TeacherRole,
      userId: userIds[1], // John Smith
      schoolId: schoolIds[0],
      name: userMap[userIds[1]]?.name || 'John Smith',
    },
    {
      role: 'homeroom' as TeacherRole,
      userId: userIds[2], // Sarah Johnson
      schoolId: schoolIds[1],
      name: userMap[userIds[2]]?.name || 'Sarah Johnson',
    },
    {
      role: 'substitute' as TeacherRole,
      userId: userIds[3], // Michael Brown
      schoolId: schoolIds[2],
      name: userMap[userIds[3]]?.name || 'Michael Brown',
    },
  ];
  
  const result = await db.insert(schema.teachers).values(teachers).returning({ id: schema.teachers.id });
  console.log(`${result.length} teachers inserted`);
  
  return result.map((teacher: { id: string }) => teacher.id);
}

/**
 * Seed classes table
 */
async function seedClasses(db: any, schoolIds: string[]) {
  console.log('Seeding classes...');
  
  const classes = [
    {
      name: '1A',
      schoolId: schoolIds[0],
    },
    {
      name: '2B',
      schoolId: schoolIds[0],
    },
    {
      name: '7C',
      schoolId: schoolIds[1],
    },
    {
      name: '9D',
      schoolId: schoolIds[2],
    },
    {
      name: '3E',
      schoolId: schoolIds[0],
    },
  ];
  
  const result = await db.insert(schema.classes).values(classes).returning({ id: schema.classes.id });
  console.log(`${result.length} classes inserted`);
  
  return result.map((cls: { id: string }) => cls.id);
}

/**
 * Seed subjects table
 */
async function seedSubjects(db: any, schoolIds: string[]) {
  console.log('Seeding subjects...');
  
  const subjects = [
    { name: 'Mathematics', schoolId: schoolIds[0] },
    { name: 'Science', schoolId: schoolIds[0] },
    { name: 'English', schoolId: schoolIds[0] },
    { name: 'History', schoolId: schoolIds[1] },
    { name: 'Physical Education', schoolId: schoolIds[1] },
    { name: 'Art', schoolId: schoolIds[2] },
    { name: 'Music', schoolId: schoolIds[2] },
    { name: 'Computer Science', schoolId: schoolIds[2] },
  ];
  
  const result = await db.insert(schema.subjects).values(subjects).returning({ id: schema.subjects.id });
  console.log(`${result.length} subjects inserted`);
  
  return result.map((subject: { id: string }) => subject.id);
}



/**
 * Seed annual schedule entries
 */
async function seedAnnualSchedule(db: any, schoolIds: string[], classIds: string[], teacherIds: string[], subjectIds: string[]) {
  console.log('Seeding annual schedule...');
  
  // Create schedules with proper day values (1-7 for days of week) and position field
  const schedules = [
    {
      schoolId: schoolIds[0],
      classId: classIds[0],
      teacherId: teacherIds[0],
      subjectId: subjectIds[0],
      day: 1, // Sunday
      hour: 1,
      position: '1-1', // day-hour format
    },
    {
      schoolId: schoolIds[0],
      classId: classIds[0],
      teacherId: teacherIds[0],
      subjectId: subjectIds[1],
      day: 1, // Sunday
      hour: 2,
      position: '1-2', // day-hour format
    },
    {
      schoolId: schoolIds[1],
      classId: classIds[2],
      teacherId: teacherIds[1],
      subjectId: subjectIds[3],
      day: 2, // Monday
      hour: 3,
      position: '2-3', // day-hour format
    },
  ];
  
  const result = await db.insert(schema.annualSchedule).values(schedules).returning({ id: schema.annualSchedule.id });
  console.log(`${result.length} annual schedule entries inserted`);
  
  return result.map((schedule: { id: string }) => schedule.id);
}

// Run seed if this file is executed directly
if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Seed failed:', error);
      process.exit(1);
    });
}

export { seed };
