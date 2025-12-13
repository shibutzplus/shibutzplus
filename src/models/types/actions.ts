export type ActionResponse<T = any> = {
    success: boolean;
    message?: string;
    data?: T;
};

export type SelectMethod = "select-option" | "deselect-option" | "remove-value" | "pop-value" | "clear" | "create-option";