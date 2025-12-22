import React, { useEffect, useState } from "react";
import InputText from "@/components/ui/inputs/InputText/InputText";
import IconBtn from "@/components/ui/buttons/IconBtn/IconBtn";
import Icons from "@/style/icons";
import styles from "./ListRow.module.css";
import { successToast, errorToast } from "@/lib/toast";

export type ListRowProps<T> = {
    item: T;
    schema: any;
    onUpdate: (id: string, data: Partial<T>) => Promise<any>;
    onDelete: (item: T) => void;
    field: {
        key: keyof T;
        placeholder: string;
        inputType?: string;
    };
    getId: (item: T) => string;
    getInitialValue: (item: T) => string;
    updateExtraFields?: (item: T) => Partial<T>;
    hasLink?: string;
};

function ListRow<T extends Record<string, any>>({
    item,
    schema,
    onUpdate,
    onDelete,
    field,
    getId,
    getInitialValue,
    updateExtraFields,
    hasLink,
}: ListRowProps<T>) {
    const [isEdit, setIsEdit] = useState(false);
    const [isEditLoading, setIsEditLoading] = useState(false);
    const [value, setValue] = useState<string>(getInitialValue(item));
    const [validationErrors, setValidationErrors] = useState<{ [K in keyof T]?: string }>({});

    useEffect(() => {
        setValue(getInitialValue(item));
    }, [item, getInitialValue]);

    const handleUpdate = async () => {
        if (!isEdit) {
            setIsEdit(true);
            return;
        }
        setIsEditLoading(true);
        setValidationErrors({});
        try {
            const dataToValidate = { ...item, [field.key]: value };
            const validationResult = schema.safeParse(dataToValidate);
            if (!validationResult.success) {
                const fieldErrors: { [K in keyof T]?: string } = {};
                validationResult.error.issues.forEach((issue: any) => {
                    const fieldName = issue.path[0] as keyof T;
                    fieldErrors[fieldName] = issue.message;
                });
                setValidationErrors(fieldErrors);
                setIsEditLoading(false);
                return;
            }
            const updateData: Partial<T> = {
                [field.key]: value,
                ...(updateExtraFields ? updateExtraFields(item) : {}),
            } as Partial<T>;
            await onUpdate(getId(item), updateData);
        } catch {
            // Optionally handle error toast here
        } finally {
            setIsEditLoading(false);
            setIsEdit(false);
        }
    };

    const shareURL = async () => {
        const teacherName = getInitialValue(item);
        const text = `${teacherName}, קישור להתחברות:\n${hasLink}`;
        try {
            await navigator.clipboard.writeText(text);
            successToast(`הקישור עבור ${teacherName} הועתק בהצלחה`);
        } catch {
            errorToast("לא ניתן להעתיק את הקישור, אנא פנו לתמיכה");
        }
    };

    return (
        <div className={styles.listRow}>
            <div className={styles.nameCell}>
                <InputText
                    key="editName"
                    id={String(field.key)}
                    name={String(field.key)}
                    value={value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
                    // Save also on Enter keypress when editing
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                        const isComposing =
                            (e.nativeEvent && (e.nativeEvent as any).isComposing) ||
                            e.key === "Process";
                        if (e.key === "Enter" && isEdit && !isEditLoading && !isComposing) {
                            e.preventDefault();
                            void handleUpdate();
                        }
                    }}
                    placeholder={field.placeholder}
                    error={validationErrors[field.key]}
                    readonly={!isEdit}
                    type={field.inputType || "text"}
                />
            </div>
            <div className={styles.redColumn}></div>

            <div className={styles.actions}>
                {hasLink && (
                    <IconBtn
                        onClick={shareURL}
                        isLoading={false}
                        Icon={<Icons.share />}
                        title={`העתק ושלח קישור אישי עבור ${getInitialValue(item)}`}
                    />
                )}

                <IconBtn onClick={handleUpdate} isLoading={isEditLoading} Icon={isEdit ? <Icons.save /> : <Icons.edit />} />
                <IconBtn onClick={() => onDelete(item)} isLoading={false} Icon={<Icons.delete />} />
            </div>
        </div>
    );
}

export default ListRow;
