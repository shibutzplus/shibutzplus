export const dynamic = 'force-dynamic';
export const runtime = 'edge';

import TeacherSignInClient from "./TeacherSignInClient";
import ContactAdminError from "@/components/auth/ContactAdminError/ContactAdminError";

interface PageProps {
    params: Promise<{ schoolId: string }>;
}

export default async function TeacherSignInPage({ params }: PageProps) {
    // הגנה מלאה - אם אנחנו בזמן בילד, אל תיגע בכלום ואל תטען שום ספריה
    const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || !process.env.NEXTAUTH_SECRET;
    
    if (isBuildTime) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    const { schoolId: rawSchoolId } = await params;
    const decodedSchoolId = decodeURIComponent(rawSchoolId);
    const schoolId = decodedSchoolId.replace(/[^a-zA-Z0-9-_]/g, "");

    if (!schoolId) {
        return <ContactAdminError />;
    }

    // ייבוא דינמי של ה-Action רק בזמן ריצה אמיתי בקלאודפלייר
    const { getSchoolAction } = await import("@/app/actions/GET/getSchoolAction");
    const schoolResp = await getSchoolAction(schoolId);

    if (!schoolResp.success || !schoolResp.data) {
        return <ContactAdminError />;
    }

    return (
        <TeacherSignInClient
            schoolId={schoolId}
            schoolName={schoolResp.data.name}
            publishDates={schoolResp.data.publishDates}
            displayAltSchedule={schoolResp.data.displayAltSchedule}
        />
    );
}
