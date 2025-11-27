import { TeacherTableProvider } from "@/context/TeacherTableContext";

export default function Layout({ children }: { children: React.ReactNode }) {
    return <TeacherTableProvider>{children}</TeacherTableProvider>;
}
