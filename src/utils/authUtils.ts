import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ActionResponse } from "@/models/types/actions";

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
      message: "Unauthorized. Please log in to access this data.",
    };
  }

  // Check if all required parameters are provided
  for (const [paramName, paramValue] of Object.entries(requiredParams)) {
    if (!paramValue) {
      return {
        success: false,
        message: `${paramName} is required`,
      };
    }
  }

  // If all checks pass, return null (indicating no error)
  return null;
}
