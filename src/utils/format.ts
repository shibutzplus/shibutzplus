import { SelectOption } from "@/models/types";
import { TeacherRole, TeacherType } from "@/models/types/teachers";
import routePath from "@/routes";

export const createSelectOptions = <T extends { id: string; name: string }>(
    data: T[] | undefined,
) => {
    if (!data || data.length === 0) return [];
    const options: SelectOption[] = data.map((item) => ({
        value: item.id,
        label: item.name,
    }));
    return options;
};

export const filterTeachersByRole = (teachers: TeacherType[], role: TeacherRole) => {
    return teachers.filter((teacher) => teacher.role === role);
};

/**
 * Sorts an array of objects by their Hebrew name property in alphabetical order (א-ב-ג...)
 * @param items - Array of objects with a name property containing Hebrew text
 * @param nameKey - The key of the property to sort by (defaults to 'name')
 * @returns A new sorted array
 */
export const sortByHebrewName = <T extends Record<string, any>>(
    items: T[],
    nameKey: keyof T = "name" as keyof T,
): T[] => {
    return [...items].sort((a, b) => {
        const nameA = String(a[nameKey]);
        const nameB = String(b[nameKey]);
        return nameA.localeCompare(nameB, "he", { numeric: true });
    });
};

export const getPageTitleFromUrl = (pathname: string) => {
    const currentPath = pathname.split("/").filter(Boolean)[0] || "";
    const routeKey = Object.keys(routePath).find(
        (key) =>
            routePath[key].p === `/${currentPath}` ||
            (currentPath === "" && routePath[key].p === "/"),
    );
    if (routeKey) return routePath[routeKey].title;
    return;
};
