"use server";

import { createTeacher } from "@/db/utils";
import { TeacherType, TeacherRequest } from "@/models/types/teachers";
import { ActionResponse } from "@/models/types/actions";
import { checkAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { revalidateTag } from "next/cache";

export async function addTeacherAction(teacherData: TeacherRequest): Promise<ActionResponse & { data?: TeacherType }> {
  try {
    const authError = await checkAuthAndParams({ 
      name: teacherData.name, 
      role: teacherData.role,
      schoolId: teacherData.schoolId 
    });
    
    if (authError) {
      return authError as ActionResponse;
    }

    const newTeacher = await createTeacher(teacherData);

    if (!newTeacher) {
      return {
        success: false,
        message: messages.teachers.createError,
      };
    }
    
    // Revalidate the server-side cache to ensure fresh data is fetched
    revalidateTag("teachers-data");

    return {
      success: true,
      message: messages.teachers.createSuccess,
      data: newTeacher,
    };
  } catch (error) {
    console.error("Error creating teacher:", error);
    return {
      success: false,
      message: messages.teachers.createError,
    };
  }
}
