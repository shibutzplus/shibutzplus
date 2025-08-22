import React, { useEffect, useState } from "react";
import styles from "./teacherRow.module.css";
import InputText from "@/components/ui/InputText/InputText";
import { errorToast, successToast } from "@/lib/toast";
import messages from "@/resources/messages";
import { useMainContext } from "@/context/MainContext";
import Btn from "@/components/ui/Btn/Btn";
import { RiEdit2Fill, RiDeleteBin6Line } from "react-icons/ri";
import { TeacherRole, TeacherRoleValues, TeacherType } from "@/models/types/teachers";
import { teacherSchema } from "@/models/validation/teacher";
import RadioGroup from "@/components/ui/RadioGroup/RadioGroup";

type TeacherRowProps = {
    teacher: TeacherType;
    handleDeleteTeacher: (e: React.MouseEvent, teacher: TeacherType) => void;
};

const TeacherRow: React.FC<TeacherRowProps> = ({ teacher, handleDeleteTeacher }) => {
    const { updateTeacher } = useMainContext();
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [isEditLoading, setIsEditLoading] = useState<boolean>(false);
    const [teacherValue, setTeacherValue] = useState<string>(teacher.name);
    const [roleValue, setRoleValue] = useState<TeacherRole>(teacher.role);
    const [validationErrors, setValidationErrors] = useState<{
        name?: string;
        role?: string;
        schoolId?: string;
    }>({});

    useEffect(()=> {
        if(teacher){
            setTeacherValue(teacher.name);
            setRoleValue(teacher.role);
        }
    },[teacher])

    const handleUpdate = async (e: React.MouseEvent, teacher: TeacherType) => {
        e.stopPropagation();
        if (!isEdit) {
            setIsEdit((prev) => !prev);
            return;
        }

        setIsEditLoading(true);
        setValidationErrors({});

        try {
            const validationResult = teacherSchema.safeParse({
                name: teacher.name,
                role: teacher.role,
                schoolId: teacher.schoolId,
            });

            if (!validationResult.success) {
                const fieldErrors: { name?: string; role?: string; schoolId?: string } = {};
                validationResult.error.issues.forEach((issue) => {
                    const field = issue.path[0] as keyof typeof fieldErrors;
                    if (field === "name" || field === "role" || field === "schoolId") {
                        fieldErrors[field] = issue.message;
                    }
                });
                setValidationErrors(fieldErrors);
                setIsEditLoading(false);
                return;
            }

            const res = await updateTeacher(teacher.id, {
                name: teacherValue,
                role: roleValue,
                schoolId: teacher.schoolId,
            });
            successToast(res ? messages.teachers.updateSuccess : messages.teachers.updateError);
            setTeacherValue(teacher.name);
        } catch (error) {
            console.error(error);
            errorToast(messages.subjects.updateError);
        } finally {
            setIsEditLoading(false);
            setIsEdit((prev) => !prev);
        }
    };

    const displayRole = (role: string): React.ReactNode => {
        switch (role) {
            case "regular":
                return <span className={styles.roleCellGreen}>מורה</span>;
            case "substitute":
                return <span className={styles.roleCellBlue}>מחליף/ה</span>;
            default:
                return <span className={styles.roleCell}>-</span>;
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
            <td>
                {isEdit ? (
                    <RadioGroup
                        name="role"
                        value={roleValue}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setRoleValue(e.target.value as TeacherRole);
                        }}
                        options={[
                            { value: TeacherRoleValues.REGULAR, label: "מורה" },
                            { value: TeacherRoleValues.SUBSTITUTE, label: "מורה מחליף/ה" },
                        ]}
                    />
                ) : (
                    displayRole(teacher.role)
                )}
            </td>
            <td className={styles.actions}>
                <Btn
                    text={isEdit ? "שמירה" : "עריכה"}
                    onClick={(e) => handleUpdate(e, teacher)}
                    isLoading={isEditLoading}
                    Icon={<RiEdit2Fill />}
                />
                <Btn
                    text="מחיקה"
                    onClick={(e) => handleDeleteTeacher(e, teacher)}
                    isLoading={false}
                    Icon={<RiDeleteBin6Line />}
                />
            </td>
        </tr>
    );
};

export default TeacherRow;
