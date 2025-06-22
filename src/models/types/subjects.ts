import { ActionResponse } from "./actions";

export type SubjectType = {
  id: string;
  name: string;
  schoolId: string;
}

export type SubjectRequest = {
  name: string;
  schoolId: string;
}

export type GetSubjectsResponse = ActionResponse & {
  data?: SubjectType[];
}
