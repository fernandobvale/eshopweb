"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Quote,
    Heading1,
    Heading2,
    Heading3,
    Link as LinkIcon,
    Image as ImageIcon,
    Undo,
    Redo,
} from "lucide-react";
import clsx from "clsx";

interface Props {
    content: string;
    onChange: (html: string) => void;
}

export default function TipTapEditor({ content, onChange }: Props) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Link.configure({ openOnClick: false }),
            Image,
            Placeholder.configure({
                placeholder: "Comece a escrever seu post...",
            }),
        ],
        content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: "prose prose-invert max-w-none focus:outline-none min-h-[400px] p-4",
            },
        },
    });

    if (!editor) return null;

    const addImage = () => {
        const url = window.prompt("URL da imagem:");
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    const setLink = () => {
        const url = window.prompt("URL do link:");
        if (url) {
            editor.chain().focus().setLink({ href: url }).run();
        }
    };

    return (
        <div className="border border-neutral-800 rounded-lg overflow-hidden bg-neutral-900">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 p-2 border-b border-neutral-800 bg-neutral-950">
                <MenuButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    active={editor.isActive("bold")}
                    icon={Bold}
                    title="Negrito"
                />
                <MenuButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    active={editor.isActive("italic")}
                    icon={Italic}
                    title="Itálico"
                />
                <div className="w-px h-6 bg-neutral-800 mx-1" />
                <MenuButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    active={editor.isActive("heading", { level: 1 })}
                    icon={Heading1}
                    title="Título 1"
                />
                <MenuButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    active={editor.isActive("heading", { level: 2 })}
                    icon={Heading2}
                    title="Título 2"
                />
                <MenuButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    active={editor.isActive("heading", { level: 3 })}
                    icon={Heading3}
                    title="Título 3"
                />
                <div className="w-px h-6 bg-neutral-800 mx-1" />
                <MenuButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    active={editor.isActive("bulletList")}
                    icon={List}
                    title="Lista"
                />
                <MenuButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    active={editor.isActive("orderedList")}
                    icon={ListOrdered}
                    title="Lista Numerada"
                />
                <MenuButton
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    active={editor.isActive("blockquote")}
                    icon={Quote}
                    title="Citação"
                />
                <div className="w-px h-6 bg-neutral-800 mx-1" />
                <MenuButton onClick={setLink} active={editor.isActive("link")} icon={LinkIcon} title="Link" />
                <MenuButton onClick={addImage} icon={ImageIcon} title="Imagem" />
                <div className="flex-1" />
                <MenuButton onClick={() => editor.chain().focus().undo().run()} icon={Undo} title="Desfazer" />
                <MenuButton onClick={() => editor.chain().focus().redo().run()} icon={Redo} title="Refazer" />
            </div>

            {/* Editor Area */}
            <EditorContent editor={editor} />
        </div>
    );
}

function MenuButton({
    onClick,
    active,
    icon: Icon,
    title,
}: {
    onClick: () => void;
    active?: boolean;
    icon: any;
    title: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={clsx(
                "p-2 rounded hover:bg-neutral-800 transition-colors",
                active ? "text-brand-500 bg-neutral-800" : "text-neutral-400"
            )}
        >
            <Icon size={18} />
        </button>
    );
}
