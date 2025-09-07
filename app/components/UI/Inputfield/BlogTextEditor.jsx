"use client"

import { useEffect } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import Underline from "@tiptap/extension-underline"
import Highlight from "@tiptap/extension-highlight"
import {TextStyle} from "@tiptap/extension-text-style"
import Color from "@tiptap/extension-color"
import TextAlign from "@tiptap/extension-text-align"
import Subscript from "@tiptap/extension-subscript"
import Superscript from "@tiptap/extension-superscript"
import {Table} from "@tiptap/extension-table"
import TableRow from "@tiptap/extension-table-row"
import TableHeader from "@tiptap/extension-table-header"
import TableCell from "@tiptap/extension-table-cell"
import TaskList from "@tiptap/extension-task-list"
import TaskItem from "@tiptap/extension-task-item"

import Label from "@/app/components/UI/Texts/Label"

const Btn = ({ active, onClick, children, title }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className={`px-2 py-1 text-xs rounded transition-colors
      ${active
        ? "bg-[var(--green)] text-white"
        : "bg-gray-100 hover:bg-[var(--green)] hover:text-white"
      }`}
  >
    {children}
  </button>
)

export default function BlogTextEditor({
  legend = "Blog szöveg",
  value = "",
  onChange,
  onPickImage, // async () => string | null  (MediaLibraryModal megnyitása, URL vissza)
}) {
  const editor = useEditor({
    immediatelyRender: false, // SSR/hydration mismatch elkerülés
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Underline,
      Highlight,
      Link.configure({ openOnClick: true, autolink: true }),
      Image.configure({ inline: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Subscript,
      Superscript,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
    },
  })

  // külső value szinkron (ha kívülről frissül)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [value, editor])

  if (!editor) return null

  return (
    <fieldset className="flex flex-col items-start rounded-md group bg-white shadow-sm">
      {legend && (
              <Label classname="px-2 py-2.5 text-xs font-bold group-focus-within:bg-[var(--green)] outline outline-white group-focus-within:outline-[var(--green)] group-focus-within:text-white bg-white rounded-t-md w-full border-b-2 border-[var(--border)] group-focus-within:border-[var(--green)]">
                {legend || null}
              </Label>
            )}

      {/* Toolbar – a Textarea stílusához igazítva (zöld hover) */}
      <div className="w-full px-2 py-2 border-b border-[var(--border)] bg-white">
        <div className="flex flex-wrap gap-1">
          <Btn active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} title="Félkövér">B</Btn>
          <Btn active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} title="Dőlt">I</Btn>
          <Btn active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Aláhúzás">U</Btn>
          <Btn active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()} title="Áthúzás">S</Btn>
          <Btn active={editor.isActive("highlight")} onClick={() => editor.chain().focus().toggleHighlight().run()} title="Kiemelés">H</Btn>

          {/* Szín */}
          <input
            type="color"
            className="ml-2 h-7 w-10 rounded cursor-pointer border border-[var(--border)] hover:border-[var(--green)]"
            onInput={(e) => editor.chain().focus().setColor(e.target.value).run()}
            value={editor.getAttributes("textStyle").color || "#000000"}
            title="Szövegszín"
          />

          {/* Igazítások */}
          <Btn active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()} title="Balra igazítás">Bal</Btn>
          <Btn active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()} title="Középre">Közép</Btn>
          <Btn active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()} title="Jobbra">Jobb</Btn>
          <Btn active={editor.isActive({ textAlign: "justify" })} onClick={() => editor.chain().focus().setTextAlign("justify").run()} title="Sorkizárt">Sorkizárt</Btn>

          {/* Listák */}
          <Btn active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Pontozott lista">• Lista</Btn>
          <Btn active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Sorszámozott lista">1. Lista</Btn>
          <Btn active={editor.isActive("taskList")} onClick={() => editor.chain().focus().toggleTaskList().run()} title="Feladatlista">☑ Task</Btn>

          {/* Link */}
          <Btn
            active={editor.isActive("link")}
            onClick={() => {
              const prev = editor.getAttributes("link").href || ""
              const url = window.prompt("Link URL:", prev)
              if (url === null) return
              if (url === "") editor.chain().focus().unsetLink().run()
              else editor.chain().focus().setLink({ href: url }).run()
            }}
            title="Link beállítása"
          >
            Link
          </Btn>
          <Btn onClick={() => editor.chain().focus().unsetLink().run()} title="Link törlése">Unlink</Btn>

          {/* Kép beszúrás (Media modal) */}
          <Btn
            onClick={async () => {
              if (onPickImage) {
                const url = await onPickImage()
                if (url) editor.chain().focus().setImage({ src: url }).run()
              } else {
                const url = window.prompt("Kép URL:")
                if (url) editor.chain().focus().setImage({ src: url }).run()
              }
            }}
            title="Kép beszúrása"
          >
            🖼 Kép
          </Btn>

          {/* Fejezetek */}
          <Btn active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="Címsor 1">H1</Btn>
          <Btn active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Címsor 2">H2</Btn>
          <Btn active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Címsor 3">H3</Btn>

          {/* Undo/Redo */}
          <Btn onClick={() => editor.chain().focus().undo().run()} title="Visszavonás">↶</Btn>
          <Btn onClick={() => editor.chain().focus().redo().run()} title="Újra">↷</Btn>
        </div>
      </div>

      {/* Editor — a Textarea-éhoz igazított “zöld fókusz” viselkedéssel */}
      <div className="w-full py-2 px-2 outline outline-white group-focus-within:border-[var(--green)] text-sm focus:outline-[var(--green)] active:outline-[var(--green)] bg-white rounded-b-md">
        <EditorContent editor={editor} className="prose max-w-none min-h-[280px]" />
      </div>
    </fieldset>
  )
}
