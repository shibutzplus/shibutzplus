import TeacherSignInClient from "./TeacherSignInClient";
import { getSchoolAction } from "@/app/actions/GET/getSchoolAction";
import ContactAdminError from "@/components/auth/ContactAdminError/ContactAdminError";

interface PageProps {
    params: Promise<{ schoolId: string }>;
}

export default async function TeacherSignInPage({ params }: PageProps) {
    const { schoolId: rawSchoolId } = await params;
    const decodedSchoolId = decodeURIComponent(rawSchoolId);
    const schoolId = decodedSchoolId.replace(/[^a-zA-Z0-9-_]/g, "");

    if (!schoolId) {
        return <ContactAdminError />;
    }

    const schoolResp = await getSchoolAction(schoolId);

    if (!schoolResp.success || !schoolResp.data) {
        return <ContactAdminError />;
    }

    return (
        <TeacherSignInClient
            schoolId={schoolId}
            schoolName={schoolResp.data.name}
        />
    );
}
