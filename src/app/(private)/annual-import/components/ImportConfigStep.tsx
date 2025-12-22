import React from "react";
import styles from "../page.module.css";
import InputText from "@/components/ui/inputs/InputText/InputText";
import DynamicInputSelect from "@/components/ui/select/InputSelect/DynamicInputSelect";
import SubmitBtn from "@/components/ui/buttons/SubmitBtn/SubmitBtn";
import EditableList from "./EditableList";
import StepNavigation from "./StepNavigation";

// Define the type here or import it if you move it to a shared types file
export type CsvAnalysisConfig = {
    teacherNameRow: number;
    headerRow: number;
    dataStartRow: number;
    separator: "empty_line" | string;
    ignoreText: string;
    hourColumn?: number;
    subjectLine?: "first" | "last" | "all";
    subjectSeparator?: string;
};

const separatorOptions = [
    { value: "empty_line", label: "שורה ריקה" },
    { value: "custom", label: "תו מותאם אישית" },
];

interface ImportConfigStepProps {
    title: string;
    // Step configuration
    config: CsvAnalysisConfig;
    onConfigChange: (key: keyof CsvAnalysisConfig, value: any) => void;

    // Custom separator handling
    customSeparator: string;
    setCustomSeparator: (val: string) => void;

    // List Data
    previewItems: string[];
    onPreviewItemsChange: (items: string[]) => void;
    listTitle: string; // e.g. "מורים שזוהו" or "כיתות שזוהו"

    // Actions
    onSave: () => void;
    saveButtonText: string;

    // Navigation
    onNext: () => void;
    onPrev: () => void;

    isLoading: boolean;
}

const ImportConfigStep: React.FC<ImportConfigStepProps> = ({
    title,
    config,
    onConfigChange,
    customSeparator,
    setCustomSeparator,
    previewItems,
    onPreviewItemsChange,
    listTitle,
    onSave,
    saveButtonText,
    onNext,
    onPrev,
    isLoading
}) => {
    return (
        <div className={styles.configSection}>
            <h2 className={`${styles.title} ${styles.stepTitle}`}>{title}</h2>

            <table className={styles.stepTable}>
                <tbody>
                    <tr>
                        {/* CONFIGURATION (First column = Right in RTL) */}
                        <td className={styles.cellConfig}>
                            <div className={styles.formCard} style={{ width: '100%' }}>
                                <h3 className={styles.sectionTitle}>הגדרות זיהוי בקובץ</h3>

                                <InputText
                                    label="מספר השורה הראשונה עם השם (מורה/כיתה)"
                                    type="number"
                                    value={config.teacherNameRow}
                                    onChange={(e) => onConfigChange("teacherNameRow", parseInt(e.target.value))}
                                    min={1}
                                />
                                <InputText
                                    label="מספר השורה הראשונה בה מתחילה הכותרת (ימים/שעות)"
                                    type="number"
                                    value={config.headerRow}
                                    onChange={(e) => onConfigChange("headerRow", parseInt(e.target.value))}
                                    min={1}
                                />
                                <InputText
                                    label="מספר השורה הראשונה בה מתחילים הנתונים"
                                    type="number"
                                    value={config.dataStartRow}
                                    onChange={(e) => onConfigChange("dataStartRow", parseInt(e.target.value))}
                                    min={1}
                                />
                                <InputText
                                    label="מספר עמודת השעות (אם מופיעה)"
                                    type="number"
                                    value={config.hourColumn || ""}
                                    onChange={(e) => onConfigChange("hourColumn", e.target.value ? parseInt(e.target.value) : undefined)}
                                    min={1}
                                    placeholder="למשל: 1"
                                />

                                <div className={styles.flexGap}>
                                    <label className={styles.inputLabel}>סימון רווח בין מערכות</label>
                                    <DynamicInputSelect
                                        options={separatorOptions}
                                        value={config.separator}
                                        onChange={(val) => onConfigChange("separator", val)}
                                        placeholder="בחר סוג הפרדה"
                                    />
                                    {config.separator === "custom" && (
                                        <div className={styles.mt2}>
                                            <InputText
                                                label="הזן תו מפריד"
                                                value={customSeparator}
                                                onChange={(e) => setCustomSeparator(e.target.value)}
                                            />
                                        </div>
                                    )}
                                </div>
                                <InputText
                                    label="טקסט להסרה מהשם (אופציונלי)"
                                    type="text"
                                    value={config.ignoreText}
                                    onChange={(e) => onConfigChange("ignoreText", e.target.value)}
                                    placeholder="לדוגמה: מערכת שעות"
                                />
                            </div>
                        </td>

                        {/* LIST (Second column = Left in RTL) */}
                        <td className={styles.cellList}>
                            <div className={styles.listHeight}>
                                <EditableList title={listTitle} items={previewItems} onChange={onPreviewItemsChange} />
                            </div>
                            <div className={`${styles.mt4} ${styles.flexEnd}`}>
                                <SubmitBtn
                                    onClick={onSave}
                                    buttonText={saveButtonText}
                                    className={styles.btnUpdate}
                                    isLoading={isLoading}
                                    type="button"
                                />
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <StepNavigation
                onNext={onNext}
                onPrev={onPrev}
                isLoading={isLoading}
            />
        </div>
    );
};

export default ImportConfigStep;
