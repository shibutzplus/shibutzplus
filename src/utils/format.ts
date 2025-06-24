import { SelectOption } from "@/models/types";

export function safeParseJSON<T>(jsonString: string | null): T | null {
    if (!jsonString) return null;
    try {
        return JSON.parse(jsonString) as T;
    } catch (e) {
        console.error("Error parsing JSON from storage:", e);
        return null;
    }
}

export const createSelectOptions = <T extends { id: string; name: string }>(
    data: T[] | undefined,
) => {
    if (!data) return [];
    const options: SelectOption[] = data.map((item) => ({
        value: item.id,
        label: item.name,
    }));
    return options;
};
