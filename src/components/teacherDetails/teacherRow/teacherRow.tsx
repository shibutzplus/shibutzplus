import React, { useEffect, useState } from "react";
import styles from "./TeacherRow.module.css";
import InputText from "@/components/ui/InputText/InputText";
import { errorToast } from "@/lib/toast";
import messages from "@/resources/messages";
import { useMainContext } from "@/context/MainContext";
import { TeacherType } from "@/models/types/teachers";
import { teacherSchema } from "@/models/validation/teacher";
import Icons from "@/style/icons";
import IconBtn from "@/components/ui/buttons/IconBtn/IconBtn";

type TeacherRowProps = {
    teacher: TeacherType;
    handleDeleteTeacher: (teacher: TeacherType) => void;
};

const TeacherRow: React.FC<TeacherRowProps> = ({ teacher, handleDeleteTeacher }) => {
    const { updateTeacher } = useMainContext();
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [isEditLoading, setIsEditLoading] = useState<boolean>(false);
    const [teacherValue, setTeacherValue] = useState<string>(teacher.name);
    const [validationErrors, setValidationErrors] = useState<{
        name?: string;
        schoolId?: string;
    }>({});

    useEffect(() => {
        if (teacher) {
            setTeacherValue(teacher.name);
        }
    }, [teacher]);

    const handleUpdate = async (teacher: TeacherType) => {
        if (!isEdit) {
            setIsEdit((prev) => !prev);
            return;
        }

        setIsEditLoading(true);
        setValidationErrors({});

        try {
            const validationResult = teacherSchema.safeParse({
                name: teacherValue,
                schoolId: teacher.schoolId,
            });

            if (!validationResult.success) {
                const fieldErrors: { name?: string; schoolId?: string } = {};
                validationResult.error.issues.forEach((issue) => {
                    const field = issue.path[0] as keyof typeof fieldErrors;
                    if (field === "name" || field === "schoolId") {
                        fieldErrors[field] = issue.message;
                    }
                });
                setValidationErrors(fieldErrors);
                setIsEditLoading(false);
                return;
            }

            const response = await updateTeacher(teacher.id, {
                name: teacherValue,
                role: "regular",
                schoolId: teacher.schoolId,
            });
            if (!response) {
                errorToast(messages.teachers.updateError);
            }
            setTeacherValue(teacher.name);
        } catch (error) {
            console.error(error);
            errorToast(messages.teachers.updateError);
        } finally {
            setIsEditLoading(false);
            setIsEdit((prev) => !prev);
        }
    };

    return (
        <tr className={styles.teacherRow}>
            <td>
                <span className={styles.dot} />
                <InputText
                    key="editName"
                    id="name"
                    name="name"
                    value={teacherValue}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setTeacherValue(e.target.value);
                    }}
                    placeholder="לדוגמא: ישראל ישראלי"
                    error={validationErrors.name}
                    readonly={!isEdit}
                />
            </td>
            <td className={styles.actions}>
                <IconBtn
                    onClick={() => handleUpdate(teacher)}
                    isLoading={isEditLoading}
                    Icon={isEdit ? <Icons.save /> : <Icons.edit />}
                />
                <IconBtn
                    onClick={() => handleDeleteTeacher(teacher)}
                    isLoading={false}
                    Icon={<Icons.delete />}
                />
            </td>
        </tr>
    );
};

export default TeacherRow;
