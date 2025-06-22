"use server";

import { createClass } from "@/db/utils";
import { ClassType, ClassRequest } from "@/models/types/classes";
import { ActionResponse } from "@/models/types/actions";
import { checkAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { revalidateTag } from "next/cache";

export async function addClassAction(classData: ClassRequest): Promise<ActionResponse & { data?: ClassType }> {
  try {
    // Check authentication and required parameters
    const authError = await checkAuthAndParams({ 
      name: classData.name, 
      schoolId: classData.schoolId 
    });
    
    if (authError) {
      return authError as ActionResponse;
    }

    // Create the class in the database
    const newClass = await createClass(classData);

    if (!newClass) {
      return {
        success: false,
        message: messages.classes.createError,
      };
    }
    
    // Revalidate the server-side cache to ensure fresh data is fetched
    revalidateTag("classes-data");

    return {
      success: true,
      message: messages.classes.createSuccess,
      data: newClass,
    };
  } catch (error) {
    console.error("Error creating class:", error);
    return {
      success: false,
      message: messages.classes.createError,
    };
  }
}
