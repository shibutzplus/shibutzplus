export type ActionResponse = {
    success: boolean;
    message: string;
};

export type SelectMethod = "select-option" | "deselect-option" | "remove-value" | "pop-value" | "clear" | "create-option";