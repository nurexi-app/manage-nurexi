"use client";

import { useEditor, EditorContent, mergeAttributes } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Youtube from "@tiptap/extension-youtube";
import Heading from "@tiptap/extension-heading";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import CharacterCount from "@tiptap/extension-character-count";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import CodeBlock from "@tiptap/extension-code-block";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Quote,
  Link as LinkIcon,
  Youtube as YoutubeIcon,
  Minus,
  Undo,
  Redo,
  Code,
  Heading1,
  Link2Off,
  Image as ImageIcon,
  Table as TableIcon,
  Code2,
  Eraser,
  HighlighterIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MediaLibraryDialog } from "./MedialibraryDialog";

function ToolbarBtn({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground transition-colors",
        "hover:bg-muted hover:text-foreground",
        active && "bg-primary text-primary-foreground hover:bg-primary/90",
        disabled && "opacity-40 cursor-not-allowed",
      )}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="h-5 w-px bg-border mx-0.5" />;
}

interface ResourceEditorProps {
  content?: any;
  onChange?: (json: any) => void;
  userId?: string;
}

export default function ResourceEditor({
  content,
  onChange,
  userId,
}: ResourceEditorProps) {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [showYoutubeInput, setShowYoutubeInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);

  // Custom heading that adds IDs
  const CustomHeading = Heading.extend({
    renderHTML({ node, HTMLAttributes }) {
      const level = node.attrs.level;
      // Get the text content from the node
      const text = node.textContent || "";
      // Generate a slug from the text
      const id = text
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

      // If there's no text, don't add an ID
      const attrs = id ? { ...HTMLAttributes, id } : HTMLAttributes;

      return [`h${level}`, mergeAttributes(attrs), 0];
    },
  });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      CustomHeading.configure({
        levels: [1, 2, 3, 4],
      }),
      Youtube.configure({
        controls: true,
        nocookie: true,
        width: 640,
        height: 360,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          class: "text-blue-500 underline cursor-pointer",
        },
      }),
      Image.configure({
        inline: true,
        resize: {
          enabled: true,
          directions: ["top", "bottom", "left", "right"],
          minWidth: 150,
          minHeight: 150,
          alwaysPreserveAspectRatio: false,
        },
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Placeholder.configure({
        placeholder: "Start writing your resource content here...",
      }),
      CharacterCount,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
      CodeBlock.configure({
        defaultLanguage: "javascript",
      }),
    ],
    content: content ?? null,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getJSON());
    },
    editorProps: {
      attributes: {
        class:
          "tiptap prose prose-sm max-w-none focus:outline-none min-h-[280px] px-4 py-3 text-foreground",
      },
    },
  });

  useEffect(() => {
    if (!editor || !content) return;
    const currentJsonString = JSON.stringify(editor.getJSON());
    const incomingJsonString = JSON.stringify(content);
    if (currentJsonString !== incomingJsonString) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) return null;

  const insertYoutube = () => {
    if (!youtubeUrl.trim()) return;
    editor.commands.setYoutubeVideo({ src: youtubeUrl });
    setYoutubeUrl("");
    setShowYoutubeInput(false);
  };

  const insertLink = () => {
    if (!linkUrl.trim()) return;
    const { from, to } = editor.state.selection;
    const hasSelection = from !== to;
    if (hasSelection) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkUrl })
        .run();
    } else {
      editor
        .chain()
        .focus()
        .insertContent(`<a href="${linkUrl}">${linkUrl}</a> `)
        .run();
    }
    setLinkUrl("");
    setShowLinkInput(false);
  };

  const insertImage = (imageUrl: string) => {
    if (!editor) return;
    editor.chain().focus().setImage({ src: imageUrl }).run();
  };

  const insertTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  };

  return (
    <>
      <div className="rounded-xl relative border border-border  bg-background">
        {/* ── toolbar ── */}
        <div className="sticky backdrop-blur-sm top-0 z-50 flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-border bg-muted/20">
          {/* Text formatting */}
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
            title="Bold"
          >
            <Bold className="h-3.5 w-3.5" />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
            title="Italic"
          >
            <Italic className="h-3.5 w-3.5" />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleCode().run()}
            active={editor.isActive("code")}
            title="Inline code"
          >
            <Code className="h-3.5 w-3.5" />
          </ToolbarBtn>

          <ToolbarDivider />

          {/* Headings */}
          <ToolbarBtn
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            active={editor.isActive("heading", { level: 1 })}
            title="Heading 1"
          >
            <Heading1 className="h-3.5 w-3.5" />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            active={editor.isActive("heading", { level: 2 })}
            title="Heading 2"
          >
            <Heading2 className="h-3.5 w-3.5" />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            active={editor.isActive("heading", { level: 3 })}
            title="Heading 3"
          >
            <Heading3 className="h-3.5 w-3.5" />
          </ToolbarBtn>

          <ToolbarBtn
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleHighlight({
                  color: "red",
                })
                .run()
            }
            active={editor.isActive("highlight")}
            title="Highlight"
          >
            <HighlighterIcon className="h-3.5 w-3.5" />
          </ToolbarBtn>

          <ToolbarDivider />

          {/* Lists */}
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
            title="Bullet list"
          >
            <List className="h-3.5 w-3.5" />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}
            title="Numbered list"
          >
            <ListOrdered className="h-3.5 w-3.5" />
          </ToolbarBtn>

          <ToolbarDivider />

          {/* Block elements */}
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive("blockquote")}
            title="Quote"
          >
            <Quote className="h-3.5 w-3.5" />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Divider"
          >
            <Minus className="h-3.5 w-3.5" />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            active={editor.isActive("codeBlock")}
            title="Code block"
          >
            <Code2 className="h-3.5 w-3.5" />
          </ToolbarBtn>

          <ToolbarDivider />

          {/* Links */}
          <ToolbarBtn
            onClick={() => setShowLinkInput((p) => !p)}
            active={editor.isActive("link") || showLinkInput}
            title="Add link"
          >
            <LinkIcon className="h-3.5 w-3.5" />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor.chain().focus().unsetLink().run()}
            disabled={!editor.isActive("link")}
            title="Remove link"
          >
            <Link2Off className="h-3.5 w-3.5" />
          </ToolbarBtn>

          <ToolbarDivider />

          {/* Media */}
          <ToolbarBtn
            onClick={() => setMediaDialogOpen(true)}
            title="Insert image"
          >
            <ImageIcon className="h-3.5 w-3.5" />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => setShowYoutubeInput((p) => !p)}
            active={showYoutubeInput}
            title="Embed YouTube video"
          >
            <YoutubeIcon className="h-3.5 w-3.5" />
          </ToolbarBtn>

          <ToolbarDivider />

          {/* Table */}
          {/* <ToolbarBtn onClick={insertTable} title="Insert table">
            <TableIcon className="h-3.5 w-3.5" />
          </ToolbarBtn> */}

          <ToolbarDivider />

          {/* Undo / Redo */}
          <ToolbarBtn
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo"
          >
            <Undo className="h-3.5 w-3.5" />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo"
          >
            <Redo className="h-3.5 w-3.5" />
          </ToolbarBtn>

          <ToolbarDivider />

          {/* Clear formatting */}
          <ToolbarBtn
            onClick={() =>
              editor.chain().focus().clearNodes().unsetAllMarks().run()
            }
            title="Clear formatting"
          >
            <Eraser className="h-3.5 w-3.5" />
          </ToolbarBtn>
        </div>

        {/* ── inline inputs ── */}
        {showLinkInput && (
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/10">
            <Input
              placeholder="https://..."
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && insertLink()}
              className="h-7 text-sm flex-1"
              autoFocus
            />
            <Button
              type="button"
              size="sm"
              onClick={insertLink}
              className="h-7 text-xs"
            >
              Insert
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setShowLinkInput(false)}
              className="h-7 text-xs"
            >
              Cancel
            </Button>
          </div>
        )}

        {showYoutubeInput && (
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/10">
            <Input
              placeholder="Paste YouTube URL here..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && insertYoutube()}
              className="h-7 text-sm flex-1"
              autoFocus
            />
            <Button
              type="button"
              size="sm"
              onClick={insertYoutube}
              className="h-7 text-xs"
            >
              Embed
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setShowYoutubeInput(false)}
              className="h-7 text-xs"
            >
              Cancel
            </Button>
          </div>
        )}

        {/* ── editor content ── */}
        <EditorContent editor={editor} />

        {/* ── word count ── */}
        <div className="px-4 py-1.5 border-t border-border bg-muted/10 text-right">
          <span className="text-[11px] text-muted-foreground">
            {editor.storage.characterCount?.words?.() ?? 0} words
          </span>
        </div>
      </div>

      {/* ── Media Library Dialog ── */}
      <MediaLibraryDialog
        open={mediaDialogOpen}
        onOpenChange={setMediaDialogOpen}
        onSelectImage={insertImage}
        userId={userId!}
      />
    </>
  );
}
