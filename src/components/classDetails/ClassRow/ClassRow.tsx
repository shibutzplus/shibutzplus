import React, { useEffect, useState } from "react";
import styles from "./ClassRow.module.css";
import InputText from "@/components/ui/InputText/InputText";
import { ClassType } from "@/models/types/classes";
import { errorToast, successToast } from "@/lib/toast";
import messages from "@/resources/messages";
import { useMainContext } from "@/context/MainContext";
import { classSchema } from "@/models/validation/class";
import Btn from "@/components/ui/buttons/Btn/Btn";
import Icons from "@/style/icons";
import IconBtn from "@/components/ui/buttons/IconBtn/IconBtn";

type ClassRowProps = {
    classItem: ClassType;
    handleDeleteClass: (classItem: ClassType) => void;
};

const ClassRow: React.FC<ClassRowProps> = ({ classItem, handleDeleteClass }) => {
    const { updateClass } = useMainContext();
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [isEditLoading, setIsEditLoading] = useState<boolean>(false);
    const [classValue, setClassValue] = useState<string>(classItem.name);
    const [validationErrors, setValidationErrors] = useState<{
        name?: string;
        schoolId?: string;
    }>({});

    useEffect(() => {
        if (classItem) {
            setClassValue(classItem.name);
        }
    }, [classItem]);

    const handleUpdate = async (classItem: ClassType) => {
        if (!isEdit) {
            setIsEdit((prev) => !prev);
            return;
        }

        setIsEditLoading(true);
        setValidationErrors({});

        try {
            const validationResult = classSchema.safeParse({
                name: classValue,
                schoolId: classItem.schoolId,
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

            const res = await updateClass(classItem.id, {
                name: classValue,
                schoolId: classItem.schoolId,
            });
            successToast(res ? messages.classes.updateSuccess : messages.classes.updateError);
        } catch (error) {
            console.error(error);
            errorToast(messages.classes.updateError);
        } finally {
            setIsEditLoading(false);
            setIsEdit((prev) => !prev);
        }
    };

    return (
        <tr className={styles.classRow}>
            <td>
                <span className={styles.dot} />
                <InputText
                    key="editName"
                    id="name"
                    name="name"
                    value={classValue}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setClassValue(e.target.value);
                    }}
                    placeholder="לדוגמה: כיתה א1"
                    error={validationErrors.name}
                    readonly={!isEdit}
                />
            </td>
            <td className={styles.actions}>
                <IconBtn
                    onClick={() => handleUpdate(classItem)}
                    isLoading={isEditLoading}
                    Icon={isEdit ? <Icons.save /> : <Icons.edit />}
                />
                <IconBtn
                    onClick={() => handleDeleteClass(classItem)}
                    isLoading={false}
                    Icon={<Icons.delete />}
                />
            </td>
        </tr>
    );
};

export default ClassRow;
