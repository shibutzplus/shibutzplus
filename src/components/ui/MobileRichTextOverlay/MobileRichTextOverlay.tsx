"use client";

import React, { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useMobileInput } from "@/context/MobileInputContext";
import { sanitizeHtml } from "@/utils/sanitize";
import styles from "./MobileRichTextOverlay.module.css";

const normalize = (html: string) => {
    const trimmed = (html || "").trim();
    if (trimmed === "<p></p>" || trimmed === "<p><br></p>") return "";
    return sanitizeHtml(trimmed);
};

const MobileRichTextOverlay: React.FC = () => {
    const { isRichTextOverlayOpen, inputValue, placeholder, onSave, closeRichTextOverlay } = useMobileInput();
    const editorRef = useRef<HTMLDivElement>(null);

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
        content: inputValue || "",
        editorProps: {
            attributes: {
                class: styles.editor,
                "data-placeholder": placeholder || "",
                dir: "auto",
            },
        },
    });

    useEffect(() => {
        if (isRichTextOverlayOpen) {
            // Prevent body scrolling when overlay is open
            document.body.style.overflow = 'hidden';
            
            // Focus the editor after a short delay
            if (editor) {
                setTimeout(() => {
                    editor.commands.focus('end');
                }, 150);
            }
        } else {
            // Restore body scrolling when overlay is closed
            document.body.style.overflow = '';
        }

        // Cleanup function to restore scrolling if component unmounts
        return () => {
            document.body.style.overflow = '';
        };
    }, [isRichTextOverlayOpen, editor]);

    useEffect(() => {
        if (!editor) return;
        const current = normalize(editor.getHTML());
        const incoming = normalize(inputValue || "");
        if (incoming !== current) {
            editor.commands.setContent(incoming, { emitUpdate: false });
        }
    }, [inputValue, editor]);

    const handleSave = () => {
        if (editor) {
            const content = normalize(editor.getHTML());
            onSave(content);
        }
        closeRichTextOverlay();
    };

    const handleCancel = () => {
        closeRichTextOverlay();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
            e.preventDefault();
            handleCancel();
        }
        // Note: We don't handle Enter for save in rich text as it's used for line breaks
    };

    if (!isRichTextOverlayOpen || !editor) return null;

    return (
        <div className={styles.overlay} onKeyDown={handleKeyDown}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <button 
                        className={styles.cancelButton} 
                        onClick={handleCancel}
                        type="button"
                    >
                        ✕
                    </button>
                    <div className={styles.title}>עריכת הוראות</div>
                    <button 
                        className={styles.saveButton} 
                        onClick={handleSave}
                        type="button"
                    >
                        שמור
                    </button>
                </div>
                <div className={styles.editorContainer} ref={editorRef}>
                    <EditorContent editor={editor} />
                </div>
                <div className={styles.toolbar}>
                    <button
                        type="button"
                        className={`${styles.toolbarButton} ${editor.isActive('bold') ? styles.active : ''}`}
                        onClick={() => editor.chain().focus().toggleBold().run()}
                    >
                        <strong>B</strong>
                    </button>
                    <button
                        type="button"
                        className={`${styles.toolbarButton} ${editor.isActive('paragraph') ? styles.active : ''}`}
                        onClick={() => editor.chain().focus().setParagraph().run()}
                    >
                        P
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MobileRichTextOverlay;
