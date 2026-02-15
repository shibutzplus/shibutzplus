"use server";

import { GetSchoolResponse } from "@/models/types/school";
import { GetTeachersResponse } from "@/models/types/teachers";
import { GetSubjectsResponse } from "@/models/types/subjects";
import { GetClassesResponse } from "@/models/types/classes";
import { getSchoolAction } from "./getSchoolAction";
import { getTeachersAction } from "./getTeachersAction";
import { getSubjectsAction } from "./getSubjectsAction";
import { getClassesAction } from "./getClassesAction";
import { PortalType } from "@/models/types";

export interface InitialDataResponse {
    school: GetSchoolResponse;
    teachers: GetTeachersResponse;
    subjects: GetSubjectsResponse;
    classes: GetClassesResponse;
}

export async function getInitialDataAction(schoolId: string): Promise<InitialDataResponse> {
    const [school, teachers, subjects, classes] = await Promise.all([
        getSchoolAction(schoolId),
        getTeachersAction(schoolId, { portalType: PortalType.Manager, includeSubstitutes: true }),
        getSubjectsAction(schoolId),
        getClassesAction(schoolId),
    ]);

    return {
        school,
        teachers,
        subjects,
        classes,
    };
}
