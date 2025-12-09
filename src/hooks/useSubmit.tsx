import { errorToast, successToast } from "@/lib/toast";
import messages from "@/resources/messages";
import { useState } from "react";
//(newTeacher: TeacherRequest) => Promise<TeacherType | undefined>
function useSubmit<T extends { schoolId: string }>(
    setFormData: (value: React.SetStateAction<T>) => void,
    successMessage: string,
    errorMessage: string,
    invalidMessage?: string,
) {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const handleSubmitAdd = async (
        e: React.FormEvent,
        formData: T,
        addNewClass: (formData: T) => Promise<string | undefined>,
    ) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            for (const key in formData) {
                // check if any of values is empty
                if (formData[key as keyof T] === "") {
                    setError(invalidMessage || messages.common.invalid);
                    setIsLoading(false);
                    return;
                }
            }

            const res = await addNewClass(formData);
            successToast(res ? successMessage : errorMessage);
            const updatedFormData = {
                ...formData,
                name: "",
                schoolId: formData.schoolId,
            };
            setFormData(updatedFormData);
        } catch (error) {
            console.error(error);
            errorToast(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmitDelete = async (
        schoolId: string,
        idToDelete: string,
        deleteFunction: (schoolId: string, idToDelete: string) => Promise<boolean>,
    ) => {
        setIsLoading(true);
        setError("");

        try {
            if (schoolId === "" || idToDelete === "") {
                setError(invalidMessage || messages.common.invalid);
                setIsLoading(false);
                return;
            }

            const res = await deleteFunction(schoolId, idToDelete);
            successToast(res ? successMessage : errorMessage, 3000);
        } catch (error) {
            console.error(error);
            errorToast(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        handleSubmitAdd,
        handleSubmitDelete,
        isLoading,
        error,
    };
}

export default useSubmit;
