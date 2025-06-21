# Shibutz Plus Database

This directory contains the database setup for Shibutz Plus using Drizzle ORM with Neon DB (PostgreSQL).

## Structure

- `index.ts` - Database connection setup
- `schema/index.ts` - Consolidated schema definitions for all tables
- `migrate.ts` - Script to run migrations
- `generate-migrations.ts` - Script to generate migration files
- `seed.ts` - Script to populate the database with initial data
- `utils.ts` - Utility functions for common database operations

## Tables

The database consists of the following tables:

- `users` - User accounts with roles (admin, teacher)
- `schools` - Schools with types (Elementary, Middle, High) and statuses (onboarding, annual, daily)
- `teachers` - Teachers with roles (existing, substitute)
- `classes` - Classes linked to schools and teachers
- `professions` - Subject areas or professions
- `schools_to_teachers` - Many-to-many relationship between schools and teachers
- `schools_to_professions` - Many-to-many relationship between schools and professions
- `teachers_to_classes` - Many-to-many relationship between teachers and classes

## Setup

1. Set the `DATABASE_URL` environment variable to your Neon DB connection string
2. Generate migrations: `npx tsx src/db/generate-migrations.ts`
3. Run migrations: `npx tsx src/db/migrate.ts`
4. Seed the database (optional): `npx tsx src/db/seed.ts`

## Usage Examples

### Basic Queries

```typescript
import { db, schema } from './db';
import { eq } from 'drizzle-orm';

// Get all schools
const schools = await db.select().from(schema.schools);

// Get a specific user by ID
const user = await db.select()
  .from(schema.users)
  .where(eq(schema.users.id, 'user_id_here'));

// Insert a new teacher
const newTeacher = await db.insert(schema.teachers)
  .values({
    name: 'New Teacher',
    role: schema.teacherRoles.EXISTING,
    subject: 'Mathematics',
  })
  .returning();
```

### Using Utility Functions

```typescript
import { getSchoolWithTeachers, createTeacher, addTeacherToSchool } from './db/utils';

// Get a school with all its teachers
const schoolWithTeachers = await getSchoolWithTeachers('school_id_here');

// Create a new teacher and add them to a school
const teacher = await createTeacher({
  name: 'New Teacher',
  role: schema.teacherRoles.EXISTING,
  subject: 'Science',
});

await addTeacherToSchool('school_id_here', teacher.id);
```

### Relations Queries

```typescript
import { db } from './db';

// Get users with their schools
const usersWithSchools = await db.query.users.findMany({
  with: {
    school: true,
  },
});

// Get classes with their teachers
const classesWithTeachers = await db.query.classes.findMany({
  with: {
    teachersToClasses: {
      with: {
        teacher: true,
      },
    },
  },
});
```

## Advanced Features

- Transactions support
- Prepared statements
- Migrations
- Type safety with TypeScript
- Relation queries

For more information, refer to the [Drizzle ORM documentation](https://orm.drizzle.team/docs/overview).
