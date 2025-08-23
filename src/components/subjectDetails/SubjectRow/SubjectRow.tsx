import React, { useEffect, useState } from "react";
import styles from "./SubjectRow.module.css";
import InputText from "@/components/ui/InputText/InputText";
import { SubjectType } from "@/models/types/subjects";
import { errorToast, successToast } from "@/lib/toast";
import messages from "@/resources/messages";
import { useMainContext } from "@/context/MainContext";
import { subjectSchema } from "@/models/validation/subject";
import Btn from "@/components/ui/buttons/Btn/Btn";
import { RiEdit2Fill, RiDeleteBin6Line } from "react-icons/ri";



type SubjectRowProps = {
    subject: SubjectType;
    handleDeleteSubject: (e: React.MouseEvent, subject: SubjectType) => void;
};

const SubjectRow: React.FC<SubjectRowProps> = ({ subject, handleDeleteSubject }) => {
    const { updateSubject } = useMainContext();
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [isEditLoading, setIsEditLoading] = useState<boolean>(false);
    const [subjectValue, setSubjectValue] = useState<string>(subject.name);
    const [validationErrors, setValidationErrors] = useState<{
        name?: string;
        schoolId?: string;
    }>({});

    useEffect(()=> {
        if(subject){
            setSubjectValue(subject.name);
        }
    },[subject])

    const handleUpdate = async (e: React.MouseEvent, subject: SubjectType) => {
        e.stopPropagation();
        if (!isEdit) {
            setIsEdit((prev) => !prev);
            return;
        }

        setIsEditLoading(true);
        setValidationErrors({});

        try {
            const validationResult = subjectSchema.safeParse({
                name: subject.name,
                schoolId: subject.schoolId,
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

            const res = await updateSubject(subject.id, {
                name: subjectValue,
                schoolId: subject.schoolId,
            });
            successToast(res ? messages.subjects.updateSuccess : messages.subjects.updateError);
            setSubjectValue(subject.name);
        } catch (error) {
            console.error(error);
            errorToast(messages.subjects.updateError);
        } finally {
            setIsEditLoading(false);
            setIsEdit((prev) => !prev);
        }
    };

    return (
        <tr className={styles.subjectRow}>
            <td>
                <span className={styles.dot}/>
                <InputText
                    key="editName"
                    id="name"
                    name="name"
                    value={subjectValue}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setSubjectValue(e.target.value);
                    }}
                    placeholder="לדוגמה: מתמטיקה"
                    error={validationErrors.name}
                    readonly={!isEdit}
                />
            </td>
            <td className={styles.actions}>
                <Btn
                    text={isEdit ? "שמירה" : "עריכה"}
                    onClick={(e) => handleUpdate(e, subject)}
                    isLoading={isEditLoading}
                    Icon={<RiEdit2Fill/>}
                />
                <Btn
                    text="מחיקה"
                    onClick={(e) => handleDeleteSubject(e, subject)}
                    isLoading={false}
                    Icon={<RiDeleteBin6Line/>}
                />
            </td>
        </tr>
    );
};

export default SubjectRow;
