"use client";

import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { sanitizeHtml } from "@/utils/sanitize";
import styles from "./InputRichText.module.css";

type InputRichTextProps = {
    value: string;
    placeholder?: string;
    onChangeHTML: (html: string) => void;
    onBlurHTML?: (html: string) => void;
    minHeight?: number;
    importantPlaceholder?: boolean;
    maxLines?: number;
};

const normalize = (html: string) => {
    const trimmed = (html || "").trim();
    if (trimmed === "<p></p>" || trimmed === "<p><br></p>") return "";
    return sanitizeHtml(trimmed);
};

const InputRichText: React.FC<InputRichTextProps> = ({
    value,
    placeholder,
    onChangeHTML,
    onBlurHTML,
    minHeight = 40,
    importantPlaceholder = false,
    maxLines,
}) => {
    const extensions = React.useMemo(() => [
        StarterKit.configure({
            blockquote: false,
            bulletList: false,
            orderedList: false,
            code: false,
            codeBlock: false,
            italic: false,
            strike: false,
            heading: false,
            horizontalRule: false,
        }),
        Link.configure({
            openOnClick: true,
            autolink: true,
            HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
            validate: (href) => /^(https?:\/\/|mailto:|tel:)/i.test(href || ""),
        }),
        Placeholder.configure({ placeholder: placeholder || "" }),
    ], [placeholder]);

    const countLines = (html: string): number => {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = html;
        const paragraphs = tempDiv.querySelectorAll("p");
        return paragraphs.length || 1;
    };
    const editor = useEditor({
        immediatelyRender: false,
        extensions,
        content: value || "",
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            if (maxLines && countLines(html) > maxLines) {
                // Revert to previous content if line limit exceeded
                editor.commands.setContent(value || "", { emitUpdate: false });
                return;
            }
            onChangeHTML(normalize(html));
        },
        editorProps: {
            attributes: {
                class: styles.editor,
                "data-placeholder": placeholder || "",
                style: `min-height:${minHeight}px; height:100%; overflow-wrap:anywhere; word-break:break-word;`,
                dir: "auto",
            },
        },
    });

    useEffect(() => {
        if (!editor) return;
        const current = normalize(editor.getHTML());
        const incoming = normalize(value || "");
        if (incoming !== current) {
            editor.commands.setContent(incoming, { emitUpdate: false });
        }
    }, [value, editor]);

    if (!editor) return null;

    return (
        <div className={styles.wrapper}>
            <EditorContent
                editor={editor}
                onBlur={() => onBlurHTML?.(normalize(editor.getHTML()))}
            />
            {value === "" ? (
                <div
                    className={`${styles.placeholder} ${importantPlaceholder ? styles.placeholderImportant : ""
                        }`}
                >
                    {placeholder || ""}
                </div>
            ) : null}
        </div>
    );
};

export default InputRichText;
