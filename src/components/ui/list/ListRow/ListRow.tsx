import React, { useEffect, useState } from "react";
import InputText from "@/components/ui/InputText/InputText";
import IconBtn from "@/components/ui/buttons/IconBtn/IconBtn";
import Icons from "@/style/icons";
import styles from "./ListRow.module.css";
import { successToast } from "@/lib/toast";
import { useShareTextOrLink } from "@/hooks/useShareTextOrLink";
import messages from "@/resources/messages";

// Generic type for row data
export type ListRowProps<T> = {
    item: T;
    schema: any; // Zod schema for validation
    onUpdate: (id: string, data: Partial<T>) => Promise<any>;
    onDelete: (item: T) => void;
    field: {
        key: keyof T;
        placeholder: string;
        inputType?: string;
    };
    getId: (item: T) => string;
    getInitialValue: (item: T) => string;
    updateExtraFields?: (item: T) => Partial<T>; // for fields like role, schoolId, etc.
    link?: string;
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
    link,
}: ListRowProps<T>) {
    const [isEdit, setIsEdit] = useState(false);
    const [isEditLoading, setIsEditLoading] = useState(false);
    const [value, setValue] = useState<string>(getInitialValue(item));
    const [validationErrors, setValidationErrors] = useState<{ [K in keyof T]?: string }>({});
    const share = useShareTextOrLink();

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
        } catch (error) {
            // Optionally handle error toast here
        } finally {
            setIsEditLoading(false);
            setIsEdit(false);
        }
    };

    const handleCopyUrl = async () => {
        if (!link) return;
        share(messages.share.teacher.title, messages.share.teacher.text, link);
    };

    return (
        <tr className={styles.listRow}>
            <td className={styles.nameCell}>
                <span className={styles.dot} />
                <InputText
                    key="editName"
                    id={String(field.key)}
                    name={String(field.key)}
                    value={value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
                    placeholder={field.placeholder}
                    error={validationErrors[field.key]}
                    readonly={!isEdit}
                    type={field.inputType || "text"}
                />
                {link ? (
                    <div className={styles.copyLink} onClick={handleCopyUrl}>
                        <Icons.copy />
                        <span>{link}</span>
                    </div>
                ) : null}
            </td>
            <td className={styles.actions}>
                <IconBtn
                    onClick={handleUpdate}
                    isLoading={isEditLoading}
                    Icon={isEdit ? <Icons.save /> : <Icons.edit />}
                />
                <IconBtn onClick={() => onDelete(item)} isLoading={false} Icon={<Icons.delete />} />
            </td>
        </tr>
    );
}

export default ListRow;
