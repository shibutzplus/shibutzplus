/**
 * Pure TypeScript DOCX (ZIP) parser that extracts paragraphs from word/document.xml.
 * Uses 'fflate' (pure JS) for ZIP + deflate decompression — no Node.js APIs, no native modules.
 * 100% compatible with Next.js Edge Runtime & Cloudflare Workers.
 */
import { unzipSync } from "fflate";

/**
 * Extracts the raw XML content of word/document.xml from a DOCX buffer.
 */
export function extractDocxXml(buffer: Uint8Array | Buffer): string {
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    const unzipped = unzipSync(bytes);
    const entry = unzipped["word/document.xml"];
    if (!entry) {
        throw new Error("word/document.xml not found in DOCX file");
    }
    return new TextDecoder("utf-8").decode(entry);
}

/**
 * Extracts all paragraph text (<w:p> containing <w:t>) from a DOCX buffer.
 * Synchronous and 100% Edge-safe.
 */
export function extractParagraphsFromDocx(buffer: Uint8Array | Buffer): string[] {
    const xmlContent = extractDocxXml(buffer);
    const paragraphs: string[] = [];

    // Match each <w:p> element
    const wpRegex = /<w:p(?:\s[^>]*)?>([\s\S]*?)<\/w:p>/g;
    let wpMatch;
    while ((wpMatch = wpRegex.exec(xmlContent)) !== null) {
        const pContent = wpMatch[1];
        // In each paragraph, match all <w:t> elements
        const wtRegex = /<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g;
        let wtMatch;
        const textParts: string[] = [];
        while ((wtMatch = wtRegex.exec(pContent)) !== null) {
            textParts.push(wtMatch[1]);
        }
        const pText = textParts.join("").trim();
        if (pText) {
            paragraphs.push(pText);
        }
    }

    return paragraphs;
}

export const CLASS_CODE_REGEX = /([א-י][׳']?[\s-]?[1-9][0-9]?|[א-י]["״][א-י][\s-]?[1-9][0-9]?)/;

const NON_CLASS_WORDS = ["הוראה", "שהייה", "פרטני", "תפקיד", "קבוצה", "חלון", "ספרנית", "מורה"];

/**
 * Normalizes any class string into its core grade+number code (e.g. "א1", "יא2", "ז3"):
 * "כיתה א1" -> "א1"
 * "כיתה א'1" -> "א1"
 * "כיתה א' 1" -> "א1"
 * "א1" -> "א1"
 * "א'1" -> "א1"
 * "א' 1" -> "א1"
 * "כיתה י"א 2" -> "יא2"
 * "יא2" -> "יא2"
 * "ז 3" -> "ז3"
 * Returns "" if the string is not a class.
 */
export function normalizeClassCode(raw: string): string {
    if (!raw) return "";
    const cleanRaw = raw.trim();
    if (NON_CLASS_WORDS.some(w => cleanRaw.includes(w))) {
        return "";
    }
    const match = cleanRaw.match(CLASS_CODE_REGEX);
    if (match && match[1]) {
        return match[1]
            .replace(/['"״׳\u05F4\u05F3\u201C\u201D\u2018\u2019`\-]/g, "")
            .replace(/\s+/g, "")
            .trim();
    }
    const classPrefixMatch = cleanRaw.match(/^(?:כיתה|כתה|class)\s+([א-י]["״׳']?[א-י]?)/i);
    if (classPrefixMatch && classPrefixMatch[1]) {
        return classPrefixMatch[1]
            .replace(/['"״׳\u05F4\u05F3\u201C\u201D\u2018\u2019`\-]/g, "")
            .replace(/\s+/g, "")
            .trim();
    }
    return "";
}
