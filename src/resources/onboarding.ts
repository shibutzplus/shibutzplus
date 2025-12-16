import { SchoolLevel } from "@/db/schema";
import { SelectOption } from "@/models/types";
import { UserGender, UserRole } from "@/models/types/auth";

export const genderOptions: SelectOption<UserGender>[] = [
    { value: "male", label: "זכר" },
    { value: "female", label: "נקבה" },
    { value: "male", label: "אחר" },
];

export const roleOptions: SelectOption<UserRole>[] = [
    { value: "principal", label: "מנהל/ת" },
    { value: "deputy_principal", label: "סגנ/ית" },
    { value: "teacher", label: "מורה" },
    { value: "teacher", label: "אחר" },
];

export const schoolLevelOptions: SelectOption<SchoolLevel>[] = [
    { value: "Elementary", label: "יסודי" },
    { value: "Middle", label: "חטיבה" },
    { value: "High", label: "תיכון" },
];
