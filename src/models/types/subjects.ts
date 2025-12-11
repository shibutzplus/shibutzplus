import { ActionResponse } from "./actions";

export type SubjectType = {
  id: string;
  name: string;
  schoolId: string;
  activity?: boolean;
}

export type SubjectRequest = {
  name: string;
  schoolId: string;
  activity?: boolean;
}

export type GetSubjectsResponse = ActionResponse & {
  data?: SubjectType[];
}
