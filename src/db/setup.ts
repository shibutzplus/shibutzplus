import { UserRole, UserGender } from "@/models/types/auth";
import { SchoolAgeGroup, SchoolStatus } from "@/models/types/school";
import { TeacherRole } from "@/models/types/teachers";
import { createUser, createSchool, createTeacher, createClass, createSubject } from "./utils";

// Sample data setup function
export async function setupSampleData() {
    console.log("Setting up sample data...");

    try {
        // Create a school
        const school = await createSchool({
            name: "FK School",
            type: "elementary" as SchoolAgeGroup,
            status: "onboarding" as SchoolStatus,
        });

        // Create subjects
        const mathSubject = await createSubject({
            name: "Mathematics",
            schoolId: school.id,
        });

        const scienceSubject = await createSubject({
            name: "Science",
            schoolId: school.id,
        });

        // Create users first
        const user1 = await createUser({
            name: "John Doe",
            email: "john@example.com",
            password: "$2b$10$dQmNjz5SsxpX.Ts.Qz46t.DHvTfGDOxcZHLAY0mGmvLnOJyGd5Dja", // hashed 'password123'
            role: "teacher" as UserRole,
            gender: "male" as UserGender,
            schoolId: school.id,
        });

        const user2 = await createUser({
            name: "Jane Smith",
            email: "jane@example.com",
            password: "$2b$10$dQmNjz5SsxpX.Ts.Qz46t.DHvTfGDOxcZHLAY0mGmvLnOJyGd5Dja", // hashed 'password123'
            role: "teacher" as UserRole,
            gender: "female" as UserGender,
            schoolId: school.id,
        });

        // Create teachers linked to users
        const teacher1 = await createTeacher({
            name: user1.name || "Teacher 1",
            role: "regular" as TeacherRole,
            userId: user1.id,
            schoolId: school.id,
        });

        const teacher2 = await createTeacher({
            name: user2.name || "Teacher 2",
            role: "regular" as TeacherRole,
            userId: user2.id,
            schoolId: school.id,
        });

        // Create classes
        const class1 = await createClass({
            name: "Class 1A",
            schoolId: school.id,
        });

        const class2 = await createClass({
            name: "Class 1B",
            schoolId: school.id,
        });

        // Create admin user
        await createUser({
            name: "Admin User",
            email: "admin@example.com",
            password: "$2b$10$dQmNjz5SsxpX.Ts.Qz46t.DHvTfGDOxcZHLAY0mGmvLnOJyGd5Dja", // hashed 'password123'
            role: "admin" as UserRole,
            gender: "male" as UserGender,
            schoolId: school.id,
        });

        console.log("Sample data setup completed successfully");
    } catch (error) {
        console.error("Sample data setup failed:", error);
        throw error;
    }
}

// Run setup if this file is executed directly
if (require.main === module) {
    setupSampleData()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}
