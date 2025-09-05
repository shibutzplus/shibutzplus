"use client";

import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import styles from "./RichText.module.css";
import { sanitizeHtml } from "@/utils/sanitize";

type Props = {
    value: string;
    placeholder?: string;
    onChangeHTML: (html: string) => void;
    onBlurHTML?: (html: string) => void;
    minHeight?: number;
};

const normalize = (html: string) => {
    const trimmed = (html || "").trim();
    if (trimmed === "<p></p>" || trimmed === "<p><br></p>") return "";
    return sanitizeHtml(trimmed);
};

export default function RichText({
    value,
    placeholder,
    onChangeHTML,
    onBlurHTML,
    minHeight = 40,
}: Props) {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
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
        ],
        content: value || "",
        onUpdate: ({ editor }) => onChangeHTML(normalize(editor.getHTML())),
        editorProps: {
            attributes: {
                class: styles.editor,
                "data-placeholder": placeholder || "",
                style: `min-height:${minHeight}px;`,
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
        </div>
    );
}
