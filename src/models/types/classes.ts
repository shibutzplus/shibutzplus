import { ActionResponse } from "./actions";

export type ClassType = {
  id: string;
  name: string;
  schoolId: string;
  activity: boolean;
}

export type ClassRequest = {
  name: string;
  schoolId: string;
  activity?: boolean;
}

export type GetClassesResponse = ActionResponse & {
  data?: ClassType[];
}