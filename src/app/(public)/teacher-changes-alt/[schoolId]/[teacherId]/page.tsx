import React from "react";
import { NextPage } from "next";
import { getTeacherAltPortalDataAction } from "@/app/actions/GET/getTeacherAltPortalDataAction";
import { TeacherRoleValues } from "@/models/types/teachers";
import router from "@/routes";
import { redirect } from "next/navigation";
import TeacherAltPortalClient from "./TeacherAltPortalClient";

interface Props {
    params: Promise<{
        schoolId: string;
        teacherId: string;
    }>;
}

const TeacherAltPortalPage: NextPage<Props> = async ({ params }) => {
    const { schoolId, teacherId } = await params;

    if (!schoolId || !teacherId) {
        redirect(router.teacherSignIn.p);
    }

    const data = await getTeacherAltPortalDataAction(schoolId, teacherId);

    if (!data.success || !data.teacher || !data.settings || !data.datesOptions || !data.selectedDate) {
        redirect(`${router.teacherSignIn.p}/${schoolId}`);
    }

    const { teacher, settings, datesOptions, selectedDate, scheduleData } = data;

    // Redirect substitute teachers immediately
    if (teacher.role === TeacherRoleValues.SUBSTITUTE) {
        redirect(`${router.teacherChanges.p}/${schoolId}/${teacherId}`);
    }

    return (
        <TeacherAltPortalClient
            teacher={teacher}
            schoolId={schoolId}
            settings={settings}
            datesOptions={datesOptions}
            selectedDate={selectedDate}
            scheduleData={scheduleData}
        />
    );
};

export default TeacherAltPortalPage;
