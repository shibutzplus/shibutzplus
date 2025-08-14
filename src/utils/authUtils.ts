import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ActionResponse } from "@/models/types/actions";
import messages from "@/resources/messages";

/**
 * Checks if the user is authenticated and validates required parameters
 * @param requiredParams Object containing parameters to validate with their names
 * @returns An ActionResponse object with success status and message
 */
export async function checkAuthAndParams(
  requiredParams: Record<string, any>
): Promise<ActionResponse | null> {
  // Check if user is authenticated
  const session = await getServerSession(authOptions);
  if (!session) {
    return {
      success: false,
      message: messages.auth.unauthorized,
    };
  }

  // Check if all required parameters are provided
  for (const [paramName, paramValue] of Object.entries(requiredParams)) {
    if (paramValue === null || paramValue === undefined || paramValue === "") {
      return {
        success: false,
        message: `${paramName} ${messages.auth.paramRequired}`,
      };
    }
  }

  // If all checks pass, return null (indicating no error)
  return null;
}
