import DOMPurify from "dompurify";

export function sanitizeHtml(dirty: string): string {
    if (!dirty) return "";
    if (typeof window === "undefined") {
        return dirty;
    }
    return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: ["p", "br", "a", "strong", "em", "u"],
        ALLOWED_ATTR: ["href", "target", "rel"],
        FORBID_TAGS: ["style", "script", "iframe", "object", "embed"],
        ALLOW_DATA_ATTR: false,
    });
}
