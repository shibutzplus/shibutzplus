export type SelectOption<T = string> = {
    value: T;
    label: string;
};

export type GroupOption = {
    readonly label: string;
    readonly options: { value: string; label: string }[];
}


export type Pair = [string, string];