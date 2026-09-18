import React from "react";

/**
 * Formats text containing WhatsApp-style (*text*) or Markdown-style (**text**)
 * bold markers into React <strong> elements.
 */
export const formatBoldText = (text: string | null | undefined): React.ReactNode => {
    if (!text) return text ?? "";

    const parts = text.split(/(\*{1,2}[^\*\n]+\*{1,2})/g);
    if (parts.length === 1) return text;

    return parts.map((part, i) => {
        if (
            (part.startsWith("**") && part.endsWith("**") && part.length > 4) ||
            (part.startsWith("*") && part.endsWith("*") && part.length > 2)
        ) {
            const inner = part.replace(/^\*+|\*+$/g, "");
            return <strong key={i}>{inner}</strong>;
        }
        return part;
    });
};
