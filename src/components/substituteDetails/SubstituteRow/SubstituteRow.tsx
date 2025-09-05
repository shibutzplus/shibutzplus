import React from "react";
import { useMainContext } from "@/context/MainContext";
import { TeacherType } from "@/models/types/teachers";
import { teacherSchema } from "@/models/validation/teacher";
import ListRow from "@/components/ui/list/ListRow/ListRow";
import { generateSchoolUrl } from "@/utils";
import { TeacherRoleValues } from "@/models/types/teachers";

type SubstituteRowProps = {
    teacher: TeacherType;
    handleDeleteTeacher: (teacher: TeacherType) => void;
};

const SubstituteRow: React.FC<SubstituteRowProps> = ({ teacher, handleDeleteTeacher }) => {
    const { updateTeacher } = useMainContext();
    return (
        <ListRow
            item={teacher}
            schema={teacherSchema}
            onUpdate={(id, data) =>
                updateTeacher(id, {
                    name: (data.name ?? teacher.name) as string,
                    role: TeacherRoleValues.REGULAR as import("@/models/types/teachers").TeacherRole,
                    schoolId: teacher.schoolId,
                })
            }
            onDelete={handleDeleteTeacher}
            field={{ key: "name", placeholder: "לדוגמה: ישראל ישראלי" }}
            getId={(t) => t.id}
            getInitialValue={(t) => t.name}
            updateExtraFields={() => ({
                role: TeacherRoleValues.REGULAR as import("@/models/types/teachers").TeacherRole,
                schoolId: teacher.schoolId,
            })}
            link={generateSchoolUrl(teacher.schoolId, teacher.id)}
        />
    );
};

export default SubstituteRow;
