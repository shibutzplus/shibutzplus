import { ActionResponse } from "./actions";

export type ClassType = {
  id: string;
  name: string;
  schoolId: string;
}

export type ClassRequest = {
  name: string;
  schoolId: string;
}

export type GetClassesResponse = ActionResponse & {
  data?: ClassType[];
}