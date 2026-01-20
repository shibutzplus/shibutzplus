"use client";

import React, { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { sanitizeHtml } from "@/utils/sanitize";
import Icons from "@/style/icons";
import styles from "./InputRichText.module.css";
import { getPresignedUrl } from "@/app/actions/upload";
import MsgPopup from "@/components/popups/MsgPopup/MsgPopup";
import PopupModal from "@/components/popups/PopupModal/PopupModal";
import LinkInputPopup from "@/components/popups/LinkInputPopup/LinkInputPopup";
import { MAX_FILE_SIZE, UPLOAD_ERROR_MESSAGES } from "@/models/constant/upload";

type InputRichTextProps = {
    value: string;
    placeholder?: string;
    onChangeHTML: (html: string) => void;
    onBlurHTML?: (html: string) => void;
    minHeight?: number;
    maxLines?: number;
    readOnly?: boolean;
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
    maxLines,
    readOnly = false,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [alertConfig, setAlertConfig] = useState({ isOpen: false, message: "" });
    const [isUploading, setIsUploading] = useState(false);
    const [linkDialogConfig, setLinkDialogConfig] = useState({ isOpen: false, initialUrl: "" });

    const closeAlert = () => setAlertConfig({ isOpen: false, message: "" });

    const extensions = React.useMemo(() => [
        StarterKit.configure({
            blockquote: false,
            bulletList: false,
            orderedList: false,
            code: false,
            codeBlock: false,
            bold: false,
            italic: false,
            strike: false,
            heading: false,
            horizontalRule: false,
        }),
        Link.configure({
            openOnClick: false,
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
        editable: !readOnly,
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
        if (editor) {
            editor.setEditable(!readOnly);
        }
    }, [editor, readOnly]);

    useEffect(() => {
        if (!editor) return;
        const current = normalize(editor.getHTML());
        const incoming = normalize(value || "");
        if (incoming !== current) {
            editor.commands.setContent(incoming, { emitUpdate: false });
        }
    }, [value, editor]);

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement;
        const link = target.closest('a');

        if (link && link.hasAttribute('href')) {
            if (readOnly) {
                // Prevent file opening in history page as we dont keep them anymore
                e.preventDefault();
                e.stopPropagation();
                setAlertConfig({ isOpen: true, message: UPLOAD_ERROR_MESSAGES.HISTORY_FILES_NOT_SAVED });
            }
            // In daily schedule mode, we do nothing and let the browser handle the link (target="_blank")
        }
    };

    const openLinkDialog = () => {
        if (!editor) return;
        const previousUrl = editor.getAttributes('link').href || "";
        setLinkDialogConfig({ isOpen: true, initialUrl: previousUrl });
    };

    const handleLinkConfirm = (url: string) => {
        if (!editor) return;

        setLinkDialogConfig({ isOpen: false, initialUrl: "" });

        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        // If selection is empty, insert the URL as text
        if (editor.state.selection.empty) {
            editor
                .chain()
                .focus()
                .insertContent(`<a href="${url}">${url}</a>`)
                .run();
            return;
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    const handleLinkCancel = () => {
        setLinkDialogConfig({ isOpen: false, initialUrl: "" });
    };

    const addFile = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = ""; // Reset to allow re-selecting the same file
        }
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > MAX_FILE_SIZE) {
            setAlertConfig({ isOpen: true, message: UPLOAD_ERROR_MESSAGES.FILE_TOO_LARGE });
            return;
        }

        setIsUploading(true);
        try {
            const { success, url, publicUrl, error } = await getPresignedUrl(file.name, file.type, file.size);

            if (!success || !url) {
                console.error("Upload preparation failed:", error);

                const message = error === "File size exceeds limit"
                    ? UPLOAD_ERROR_MESSAGES.FILE_TOO_LARGE
                    : UPLOAD_ERROR_MESSAGES.UPLOAD_FAILED;
                setAlertConfig({ isOpen: true, message });
                return;
            }

            const response = await fetch(url, {
                method: "PUT",
                body: file,
                headers: {
                    "Content-Type": file.type,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to upload file to storage");
            }

            if (editor) {
                // Insert the link
                editor
                    .chain()
                    .focus()
                    .insertContent(`<a href="${publicUrl}" target="_blank" rel="noopener noreferrer">${file.name}</a> `)
                    .run();
            }

        } catch (error) {
            console.error(error);
            setAlertConfig({ isOpen: true, message: UPLOAD_ERROR_MESSAGES.UPLOAD_FAILED });
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    if (!editor) return null;

    return (
        <>
            <div className={styles.wrapper}>
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                />
                <div className={styles.editorContainer} onClickCapture={handleClick}>
                    <EditorContent
                        editor={editor}
                        onBlur={() => onBlurHTML?.(normalize(editor.getHTML()))}
                    />
                    {value === "" ? (
                        <div className={styles.placeholder}>
                            {placeholder || ""}
                        </div>
                    ) : null}
                </div>
                {!readOnly && (
                    <div className={styles.toolbar}>
                        <button
                            onClick={openLinkDialog}
                            onMouseDown={(e) => e.preventDefault()}
                            className={`${styles.toolbarBtn} ${editor.isActive('link') ? styles.active : ''}`}
                            type="button"
                            title="קישור"
                        >
                            <Icons.link size={16} />
                        </button>
                        <button
                            onClick={addFile}
                            onMouseDown={(e) => e.preventDefault()}
                            className={styles.toolbarBtn}
                            type="button"
                            title="צירוף קובץ"
                            disabled={isUploading}
                            style={{ opacity: isUploading ? 0.6 : 1, cursor: isUploading ? 'not-allowed' : 'pointer' }}
                        >
                            {isUploading ? (
                                <Icons.hourglass className={styles.spinning} size={18} />
                            ) : (
                                <Icons.upload size={18} />
                            )}
                        </button>
                    </div>
                )}
            </div>

            <PopupModal
                isOpen={alertConfig.isOpen}
                onClose={closeAlert}
                size="S"
            >
                <MsgPopup
                    message={alertConfig.message}
                    displayIcon={false}
                    onOk={closeAlert}
                    preventGlobalClose={true}
                />
            </PopupModal>

            <PopupModal
                isOpen={linkDialogConfig.isOpen}
                onClose={handleLinkCancel}
                size="S"
            >
                <LinkInputPopup
                    initialUrl={linkDialogConfig.initialUrl}
                    onConfirm={handleLinkConfirm}
                    onCancel={handleLinkCancel}
                />
            </PopupModal>
        </>
    );
};

export default InputRichText;
