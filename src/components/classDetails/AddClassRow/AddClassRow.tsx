import React, { useState } from "react";
import { useMainContext } from "@/context/MainContext";
import messages from "@/resources/messages";
import InputText from "@/components/ui/InputText/InputText";
import { errorToast, successToast } from "@/lib/toast";
import { classSchema } from "@/models/validation/class";
import Btn from "@/components/ui/Btn/Btn";
import { FaPlus } from "react-icons/fa6";

const AddClassRow: React.FC = () => {
    const { school, addNewClass } = useMainContext();
    const [classValue, setClassValue] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [validationErrors, setValidationErrors] = useState<{
        name?: string;
        schoolId?: string;
    }>({});

    const handleSubmitAdd = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsLoading(true);
        setValidationErrors({});

        try {
            const validationResult = classSchema.safeParse({
                name: classValue,
                schoolId: school?.id || "",
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
                setIsLoading(false);
                return;
            }

            const res = await addNewClass({
                name: classValue,
                schoolId: school?.id || "",
            });
            successToast(res ? messages.classes.createSuccess : messages.classes.createError);
            setClassValue("");
        } catch (error) {
            console.error(error);
            errorToast(messages.classes.createError);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <tr>
            <td>
                <InputText
                    key="addName"
                    id="name"
                    name="name"
                    value={classValue}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setClassValue(e.target.value);
                    }}
                    placeholder="לדוגמה: כיתה א1"
                    error={validationErrors.name}
                />
            </td>
            <td>
                <Btn
                    text="הוספת כיתה"
                    onClick={handleSubmitAdd}
                    isLoading={isLoading}
                    Icon={<FaPlus />}
                />
            </td>
        </tr>
    );
};

export default AddClassRow;
