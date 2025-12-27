import { SelectOption } from "@/models/types";
import { TeacherRole, TeacherType } from "@/models/types/teachers";


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

export const filterTeachersByRole = (teachers: TeacherType[], role: TeacherRole) => {
    return teachers.filter((teacher) => teacher.role === role);
};

/**
 * Creates a button text for a new select option
 * @param template - string with placeholder {0} for the input value
 * @param inputValue - the value to insert into the template
 * @returns
 */
export const createNewSelectOption_btnText = (inputValue: string, template?: string) => {
    return template?.replace("{0}", inputValue) || inputValue;
};


export const convertHTMLToContent = (html: string) => {
    // Handle anchor tags - convert to markdown format
    // More flexible regex to handle various attribute orders and formats
    html = html.replace(
        /<a\s+[^>]*?href\s*=\s*["']([^"']*?)["'][^>]*?>(.*?)<\/a>/gi,
        (match, href, text) => {
            // Decode HTML entities in the URL
            const decodedHref = href
                .replace(/&amp;/g, "&")
                .replace(/&lt;/g, "<")
                .replace(/&gt;/g, ">")
                .replace(/&quot;/g, '"');
            const cleanText = text.trim();

            // Always return markdown link format [text](url)
            return `[${cleanText}](${decodedHref})`;
        },
    );

    html = html.replace(/<br\s*\/?>/gi, "\n");

    html = html.replace(/<ol>\s*([\s\S]*?)\s*<\/ol>/g, (match, listContent) => {
        const items = listContent.match(/<li>([\s\S]*?)<\/li>/g) || [];
        return (
            "\n" +
            items
                .map(
                    (item: string, index: number) =>
                        `${index + 1}. ` + item.replace(/<li>([\s\S]*?)<\/li>/, "$1").trim() + "\n",
                )
                .join("") +
            "\n"
        );
    });

    html = html.replace(/<ul>\s*([\s\S]*?)\s*<\/ul>/g, (match, listContent) => {
        const items = listContent.match(/<li>([\s\S]*?)<\/li>/g) || [];
        return (
            "\n" +
            items
                .map(
                    (item: string) =>
                        "* " + item.replace(/<li>([\s\S]*?)<\/li>/, "$1").trim() + "\n",
                )
                .join("") +
            "\n"
        );
    });

    html = html.replace(/<p>([\s\S]*?)<\/p>/g, "$1\n\n");
    html = html.replace(/<strong>([\s\S]*?)<\/strong>/g, "**$1**");
    html = html.replace(/<div[^>]*>\s*([\s\S]*?)\s*<\/div>/, "$1\n");

    html = html
        .replace(/\n{3,}/g, "\n\n")
        .replace(/^\s+|\s+$/g, "")
        .replace(/ +$/gm, "")
        .replace(/([^\n])$/, "$1\n");

    return html;
};
