import TeacherSignInClient from "./TeacherSignInClient";
import { getTeachersAction } from "@/app/actions/GET/getTeachersAction";
import { getSchoolAction } from "@/app/actions/GET/getSchoolAction";
import ContactAdminError from "@/components/auth/ContactAdminError/ContactAdminError";
import { SelectOption, PortalType } from "@/models/types";
import { TeacherType } from "@/models/types/teachers";

interface PageProps {
    params: Promise<{ schoolId: string }>;
}

export default async function TeacherSignInPage({ params }: PageProps) {
    const { schoolId: rawSchoolId } = await params;
    // Decode and then sanitize to handle URL encoded characters (like %D7%9B -> כ -> removed)
    const decodedSchoolId = decodeURIComponent(rawSchoolId);
    const schoolId = decodedSchoolId.replace(/[^a-zA-Z0-9-_]/g, "");

    if (!schoolId) {
        return <ContactAdminError />;
    }

    // Parallel data fetching for performance
    const [schoolResp, teachersResp] = await Promise.all([
        getSchoolAction(schoolId),
        getTeachersAction(schoolId, { portalType: PortalType.Teacher, includeSubstitutes: false }),
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
