import { SelectOption } from "@/models/types";

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
