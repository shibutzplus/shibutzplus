"use client";

import React, { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useMobileSize } from "@/hooks/useMobileSize";
import { useMobileInput } from "@/context/MobileInputContext";
import styles from "./InputRichText.module.css";
import { sanitizeHtml } from "@/utils/sanitize";

type InputRichTextProps = {
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

const InputRichText: React.FC<InputRichTextProps> = ({
    value,
    placeholder,
    onChangeHTML,
    onBlurHTML,
    minHeight = 40,
}) => {
    const isMobile = useMobileSize();
    const { openRichTextOverlay } = useMobileInput();
    const [displayValue, setDisplayValue] = useState(value || "");

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
        onUpdate: ({ editor }) => {
            if (!isMobile) {
                onChangeHTML(normalize(editor.getHTML()));
            }
        },
        editorProps: {
            attributes: {
                class: `${styles.editor} ${isMobile ? styles.mobileEditor : ''}`,
                "data-placeholder": placeholder || "",
                style: `min-height:${minHeight}px; height: 100%;`,
                dir: "auto",
            },
        },
        editable: !isMobile,
    });

    useEffect(() => {
        if (!editor) return;
        const current = normalize(editor.getHTML());
        const incoming = normalize(value || "");
        if (incoming !== current) {
            editor.commands.setContent(incoming, { emitUpdate: false });
            setDisplayValue(incoming);
        }
    }, [value, editor]);

    const handleMobileClick = () => {
        if (isMobile) {
            const currentValue = value || "";
            openRichTextOverlay(
                currentValue,
                placeholder || "",
                (newValue: string) => {
                    setDisplayValue(newValue);
                    onChangeHTML(newValue);
                    if (onBlurHTML) {
                        onBlurHTML(newValue);
                    }
                }
            );
        }
    };

    const handleDesktopBlur = () => {
        if (!isMobile && editor) {
            onBlurHTML?.(normalize(editor.getHTML()));
        }
    };

    if (!editor) return null;

    return (
        <div 
            className={`${styles.wrapper} ${isMobile ? styles.mobileWrapper : ''}`}
            onClick={handleMobileClick}
        >
            <EditorContent
                editor={editor}
                onBlur={handleDesktopBlur}
            />
            {value === "" ? <div className={styles.placeholder}>{placeholder || ""}</div> : null}
        </div>
    );
};

export default InputRichText;
