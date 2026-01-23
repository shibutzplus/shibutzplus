import TeacherSignInClient from "./TeacherSignInClient";
import { getTeachersAction } from "@/app/actions/GET/getTeachersAction";
import { getSchoolAction } from "@/app/actions/GET/getSchoolAction";
import ContactAdminError from "@/components/auth/ContactAdminError/ContactAdminError";
import { SelectOption } from "@/models/types";
import { TeacherType } from "@/models/types/teachers";

interface PageProps {
    params: Promise<{ schoolId: string }>;
}

export default async function TeacherSignInPage({ params }: PageProps) {
    const { schoolId } = await params;

    if (!schoolId) {
        return <ContactAdminError />;
    }

    // Parallel data fetching for performance
    const [schoolResp, teachersResp] = await Promise.all([
        getSchoolAction(schoolId),
        getTeachersAction(schoolId, { isPrivate: false, hasSub: false }),
    ]);

    if (!schoolResp.success || !schoolResp.data) {
        return <ContactAdminError />;
    }

    if (!teachersResp.success) {
        return <ContactAdminError />;
    }

    const teachersData = teachersResp.data || [];

    // Transform teachers for the dropdown
    const teacherOptions: SelectOption[] = teachersData.map((teacher: TeacherType) => ({
        value: teacher.id,
        label: teacher.name,
    }));

    return (
        <TeacherSignInClient
            schoolId={schoolId}
            schoolName={schoolResp.data.name}
            initialTeachers={teacherOptions}
            initialTeachersFull={teachersData}
        />
    );
}
