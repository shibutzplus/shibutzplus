import React, { useState } from "react";
import Btn from "@/components/ui/buttons/Btn/Btn";
import InputText from "@/components/ui/inputs/InputText/InputText";
import Icons from "@/style/icons";
import { infoToast } from "@/lib/toast";
import styles from "./AddListRow.module.css";

// T is the shape of the data to add (e.g., { name: string, schoolId: string })
export type AddListRowProps<T> = {
    schema: any; // Zod schema for validation
    addFunction: (data: T) => Promise<any>;
    field: {
        key: keyof T;
        placeholder: string;
        inputType?: string;
    };
    initialValues: T;
    errorMessages?: { [field in keyof T]?: string };
    buttonLabel?: string;
    buttonIcon?: React.ReactNode;
    onSuccess?: () => void;
    onInputChange?: (value: string) => void;
};

function AddListRow<T extends Record<string, any>>({
    schema,
    addFunction,
    field,
    initialValues,
    errorMessages = {},
    buttonLabel = "הוספה",
    buttonIcon = <Icons.plus />,
    onSuccess,
    onInputChange,
}: AddListRowProps<T>) {
    const [values, setValues] = useState<T>(initialValues);
    const [isLoading, setIsLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState<{ [K in keyof T]?: string }>({});

    const handleInputChange = (key: keyof T) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setValues((prev) => ({ ...prev, [key]: value }));
        if (onInputChange) {
            onInputChange(value);
        }
    };

    const handleSubmitAdd = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsLoading(true);
        setValidationErrors({});

        try {
            const validationResult = schema.safeParse(values);
            if (!validationResult.success) {
                const fieldErrors: { [K in keyof T]?: string } = {};
                validationResult.error.issues.forEach((issue: any) => {
                    const field = issue.path[0] as keyof T;
                    fieldErrors[field] = issue.message;
                });
                setValidationErrors(fieldErrors);
                setIsLoading(false);
                return;
            }
            const response = await addFunction(values);
            if (response) {
                setValues(initialValues);
                if (onSuccess) onSuccess();
                if (onInputChange) {
                    onInputChange((initialValues[field.key] as string) || "");
                }
            } else {
                infoToast(Object.values(errorMessages)[0] || "בעיה בהוספה");
            }
        } catch (error) {
            console.error(error);
            infoToast(Object.values(errorMessages)[0] || "בעיה בהוספה");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.addListRow}>
            <div key={String(field.key)} className={styles.addListRowInput}>
                <InputText
                    key={String(field.key)}
                    id={String(field.key)}
                    name={String(field.key)}
                    value={values[field.key] || ""}
                    onChange={handleInputChange(field.key)}
                    placeholder={field.placeholder}
                    error={validationErrors[field.key]}
                    type={field.inputType || "text"}
                    style={{ minWidth: 200, width: "100%" }}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            // Simulate a click event for the add button
                            handleSubmitAdd(e as any);
                        }
                    }}
                />
            </div>
            <div className={styles.addListBtn}>
                <Btn
                    text={buttonLabel}
                    onClick={handleSubmitAdd}
                    isLoading={isLoading}
                    Icon={buttonIcon}
                    className={styles.smallBtn}
                />
            </div>
        </div>
    );
}

export default AddListRow;
