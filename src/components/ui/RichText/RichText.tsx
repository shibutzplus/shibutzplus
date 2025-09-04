"use client"

import React, { useEffect } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"
import styles from "./RichText.module.css"

type Props = {
  value: string
  placeholder?: string
  onChangeHTML: (html: string) => void
  onBlurHTML?: (html: string) => void
  minHeight?: number
}

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
      Link.configure({ openOnClick: true, autolink: true }),
      Placeholder.configure({ placeholder: placeholder || "" }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => onChangeHTML(editor.getHTML()),
    editorProps: {
      attributes: {
        class: styles.editor,
        "data-placeholder": placeholder || "",
        style: `min-height:${minHeight}px;`,
      },
    },
  })

  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    if ((value || "") !== current) {
      editor.commands.setContent(value || "", { emitUpdate: false })
    }
  }, [value, editor])

  if (!editor) return null

  return (
    <div className={styles.wrapper}>
      <EditorContent editor={editor} onBlur={() => onBlurHTML?.(editor.getHTML())} />
    </div>
  )
}
