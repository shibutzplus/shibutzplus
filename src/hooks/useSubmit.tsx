import messages from "@/resources/messages";
import { useState } from "react";
import toast from "react-hot-toast";

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
        addNewClass: (formData: T) => Promise<boolean>,
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
            toast.success(res ? successMessage : errorMessage, {
                duration: 5000,
                position: "top-center",
            });
            const updatedFormData = {
                ...formData,
                name: "",
                schoolId: formData.schoolId,
            };
            setFormData(updatedFormData);
        } catch (error) {
            console.error(error);
            toast.error(errorMessage, {
                duration: 5000,
                position: "bottom-left",
            });
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
            toast.success(res ? successMessage : errorMessage, {
                duration: 5000,
                position: "top-center",
            });
        } catch (error) {
            console.error(error);
            toast.error(errorMessage, {
                duration: 5000,
                position: "bottom-left",
            });
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
