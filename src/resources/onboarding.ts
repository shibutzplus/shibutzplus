import { SchoolLevel } from "@/db/schema";
import { SelectOption } from "@/models/types";
import { UserGender, UserRole } from "@/models/types/auth";
import { USER_ROLES, USER_GENDER } from "@/models/constant/auth";
import { SCHOOL_LEVEL } from "@/models/constant/school";

export const genderOptions: SelectOption<UserGender>[] = [
    { value: USER_GENDER.MALE, label: "זכר" },
    { value: USER_GENDER.FEMALE, label: "נקבה" },
    { value: USER_GENDER.MALE, label: "אחר" },
];

export const roleOptions: SelectOption<UserRole>[] = [
    { value: USER_ROLES.PRINCIPAL, label: "מנהל/ת" },
    { value: USER_ROLES.DEPUTY_PRINCIPAL, label: "סגנ/ית" },
    { value: USER_ROLES.TEACHER, label: "מורה" },
    { value: USER_ROLES.TEACHER, label: "אחר" },
];

export const schoolLevelOptions: SelectOption<SchoolLevel>[] = [
    { value: SCHOOL_LEVEL.ELEMENTARY, label: "יסודי" },
    { value: SCHOOL_LEVEL.MIDDLE, label: "חטיבה" },
    { value: SCHOOL_LEVEL.HIGH, label: "תיכון" },
];
