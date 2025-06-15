"use server";

import connectToDatabase from "@/lib/mongodb";
import msg from "@/resources/messages";
import { TeacherRequest } from "@/models/types/teachers";
import Teacher from "@/models/schemas/Teacher";

const addTeacher = async (params: TeacherRequest) => {
    try {
        const { name, role, subject, classes, notes } = params;

        if (!name || !role || !subject || !classes) {
            return { success: false, data: null, message: msg.addTeacher.invalid };
        }

        await connectToDatabase();
        if (await Teacher.findOne({ name, role, subject, classes })) {
            return { success: false, message: msg.addTeacher.exist };
        }

        await Teacher.create({ name, role, subject, classes, notes });
        return {
            success: true,
            data: { name, role, subject, classes, notes },
            message: msg.addTeacher.success,
        };
    } catch (error) {
        return { success: false, data: null, message: msg.addTeacher.error };
    }
};

export default addTeacher;
