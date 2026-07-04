export const dynamic = 'force-dynamic';
export const runtime = 'edge';
import React from "react";
import { NextPage } from "next";
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
    // הגנה מלאה - אם אנחנו בזמן בילד, אל תיגע בכלום ואל תטען שום ספריה
    const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || !process.env.NEXTAUTH_SECRET;
    
    if (isBuildTime) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    const { schoolId, teacherId } = await params;

    if (!schoolId || !teacherId) {
        redirect(router.teacherSignIn.p);
    }

    const { getTeacherAltPortalDataAction } = await import("@/app/actions/GET/getTeacherAltPortalDataAction");
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
