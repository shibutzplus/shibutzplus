"use server";

import { getTeachersAction, PublicTeacher } from "@/app/actions/GET/getTeachersAction";

export type GetPublicTeachersResponse = {
  success: boolean;
  message: string;
  data?: PublicTeacher[];
};

export async function getPublicTeachersAction(
  schoolId: string
): Promise<GetPublicTeachersResponse> {
  return await getTeachersAction(schoolId, { allowUnauthedPortal: true });
}
