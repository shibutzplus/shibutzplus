import createDOMPurify from "isomorphic-dompurify";

const DOMPurify = createDOMPurify();

export function sanitizeHtml(dirty: string) {
    return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: ["p", "br", "a", "strong", "em", "u"],
        ALLOWED_ATTR: ["href", "target", "rel"],
        FORBID_TAGS: ["style", "script", "iframe", "object", "embed"],
        ALLOW_DATA_ATTR: false,
    });
}
