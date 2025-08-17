import { SelectOption } from "@/models/types";

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

/**
 * Sorts an array of objects by their Hebrew name property in alphabetical order (א-ב-ג...)
 * @param items - Array of objects with a name property containing Hebrew text
 * @param nameKey - The key of the property to sort by (defaults to 'name')
 * @returns A new sorted array
 */
export const sortByHebrewName = <T extends Record<string, any>>(
    items: T[],
    nameKey: keyof T = 'name' as keyof T
): T[] => {
    return [...items].sort((a, b) => {
        const nameA = String(a[nameKey]);
        const nameB = String(b[nameKey]);
        return nameA.localeCompare(nameB, 'he', { numeric: true });
    });
};
