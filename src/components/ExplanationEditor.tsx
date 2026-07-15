import { BubbleMenu } from "@tiptap/react/menus";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Youtube from "@tiptap/extension-youtube";
import LinkExt from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Typography from "@tiptap/extension-typography";
import { Markdown } from "tiptap-markdown";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  List,
  ListOrdered,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Link2Off,
  Youtube as YoutubeIcon,
  Minus,
  Undo,
  Redo,
  Highlighter,
  FileText,
  X,
  Check,
  ExternalLink,
  Heading2,
  Heading3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Toggle } from "./ui/toggle";

// ─── toolbar toggle ───────────────────────────────────────────────────────────

function TB({
  pressed,
  onPress,
  title,
  disabled,
  children,
}: {
  pressed?: boolean;
  onPress: () => void;
  title: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Toggle
      size="sm"
      pressed={!!pressed}
      onPressedChange={onPress}
      disabled={disabled}
      title={title}
      aria-label={title}
      className="h-8 w-8 p-0 cursor-pointer data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
    >
      {children}
    </Toggle>
  );
}

// ─── link input bar ───────────────────────────────────────────────────────────

function LinkInputBar({
  initial,
  onConfirm,
  onRemove,
}: {
  initial: string;
  onConfirm: (url: string, newTab: boolean) => void;
  onRemove: () => void;
}) {
  const [url, setUrl] = useState(initial);
  const [newTab, setNewTab] = useState(true);

  return (
    <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border bg-muted/10">
      <LinkIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      <Input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://..."
        className="h-7 text-sm flex-1 border-none shadow-none focus-visible:ring-0"
        autoFocus
        onKeyDown={(e) => e.key === "Enter" && onConfirm(url, newTab)}
      />
      <button
        type="button"
        onClick={() => setNewTab((p) => !p)}
        title={newTab ? "Opens in new tab" : "Opens in same tab"}
        className={cn(
          "h-7 w-7 flex items-center justify-center rounded-md transition-colors",
          newTab
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-muted",
        )}
      >
        <ExternalLink className="h-3.5 w-3.5" />
      </button>
      <Button
        type="button"
        size="sm"
        className="h-7 px-3 text-xs"
        onClick={() => onConfirm(url, newTab)}
      >
        <Check className="h-3 w-3" />
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
        onClick={onRemove}
        title="Remove link"
      >
        <Link2Off className="h-3.5 w-3.5" />
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="h-7 w-7 p-0"
        onClick={() => onConfirm("", false)}
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

// ─── markdown import dialog ───────────────────────────────────────────────────

function MarkdownImportDialog({
  onImport,
}: {
  onImport: (markdown: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [md, setMd] = useState("");

  const handleImport = () => {
    if (!md.trim()) return;
    onImport(md);
    setMd("");
    setOpen(false);
    toast.success("Markdown imported and converted");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5 text-[12px] h-7"
        >
          <FileText className="h-3.5 w-3.5" />
          Import Markdown
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Import Markdown</DialogTitle>
        </DialogHeader>
        <div className="space-y-3  no-scrollbar max-h-[50vh] overflow-y-auto px-4">
          <Label className="text-[12px] text-muted-foreground">
            Paste your Markdown explanation below. It will be converted to rich
            text and replace the current editor content.
          </Label>
          <Textarea
            value={md}
            onChange={(e) => setMd(e.target.value)}
            placeholder={`## Key points\n\n- Metronidazole is a **nitroimidazole** antibiotic\n- Used for *anaerobic* infections\n\n> Remember: avoid alcohol during treatment`}
            className="min-h-[200px] font-mono text-sm resize-none"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleImport}
              disabled={!md.trim()}
            >
              Convert & import
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── main editor ──────────────────────────────────────────────────────────────

interface ExplanationEditorProps {
  content?: any; // Tiptap JSON (rich_explanation from DB)
  plainText?: string; // fallback plain explanation for "convert" button
  onChange?: (json: any) => void;
}

export default function ExplanationEditor({
  content,
  plainText,
  onChange,
}: ExplanationEditorProps) {
  console.log("content: ", content);
  const [showYoutubeInput, setShowYoutubeInput] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const initialised = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
        code: false,
        codeBlock: false,
      }),
      Youtube.configure({ controls: true, nocookie: true }),
      LinkExt.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          class: "text-blue-500 underline cursor-pointer",
          rel: "noopener noreferrer",
        },
      }),
      Placeholder.configure({
        placeholder:
          "Write a clear explanation for this question. Use headings, bullet points, and highlights to emphasise key clinical terms...",
      }),
      Highlight.configure({ multicolor: false }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Typography, // keyboard shortcuts: **, ##, >, -, 1. etc
      Markdown.configure({
        // auto-detect and convert pasted Markdown
        transformPastedText: true,
        transformCopiedText: false,
      }),
    ],
    content: content ?? null,
    onUpdate: ({ editor }) => onChange?.(editor.getJSON()),
    editorProps: {
      attributes: {
        class:
          "tiptap-question prose prose-sm max-w-none focus:outline-none min-h-[140px] px-4 py-3 text-foreground",
      },
    },
  });

  // seed content on edit page load — only once
  useEffect(() => {
    if (!editor || initialised.current) return;
    if (content) {
      editor.commands.setContent(content);
      initialised.current = true;
    }
  }, [editor, content]);

  if (!editor) return null;

  const insertYoutube = () => {
    if (!youtubeUrl.trim()) return;
    editor.commands.setYoutubeVideo({ src: youtubeUrl });
    setYoutubeUrl("");
    setShowYoutubeInput(false);
  };

  const importMarkdown = (md: string) => {
    editor.commands.setContent(md);
    onChange?.(editor.getJSON());
  };

  const convertPlainText = () => {
    if (!plainText?.trim()) return;
    importMarkdown(plainText);
    toast.success("Plain explanation converted to rich text");
  };

  const currentLinkHref = editor.getAttributes("link").href ?? "";

  return (
    <div className="rounded-xl border border-border overflow-visible  bg-background shadow-sm">
      {/* ══ TOOLBAR ══════════════════════════════════════════════════════════ */}
      <div className="sticky backdrop-blur-sm top-0 z-50 flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-border bg-muted/20">
        <TB
          title="Undo"
          onPress={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo className="h-3.5 w-3.5" />
        </TB>
        <TB
          title="Redo"
          onPress={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo className="h-3.5 w-3.5" />
        </TB>

        <Separator orientation="vertical" className="h-5 mx-1" />

        <TB
          title="Heading 1"
          pressed={editor.isActive("heading", { level: 1 })}
          onPress={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
        >
          <Heading1 className="h-3.5 w-3.5" />
        </TB>
        <TB
          title="Heading 2"
          pressed={editor.isActive("heading", { level: 2 })}
          onPress={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <Heading2 className="h-3.5 w-3.5" />
        </TB>
        <TB
          title="Heading 3"
          pressed={editor.isActive("heading", { level: 3 })}
          onPress={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          <Heading3 className="h-3.5 w-3.5" />
        </TB>

        <Separator orientation="vertical" className="h-5  mx-1" />

        <TB
          title="Bold"
          pressed={editor.isActive("bold")}
          onPress={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-3.5 w-3.5" />
        </TB>
        <TB
          title="Italic"
          pressed={editor.isActive("italic")}
          onPress={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-3.5 w-3.5" />
        </TB>
        <TB
          title="Underline"
          pressed={editor.isActive("underline")}
          onPress={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="h-3.5 w-3.5" />
        </TB>
        <TB
          title="Strikethrough"
          pressed={editor.isActive("strike")}
          onPress={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="h-3.5 w-3.5" />
        </TB>
        <TB
          title="Highlight"
          pressed={editor.isActive("highlight")}
          onPress={() => editor.chain().focus().toggleHighlight().run()}
        >
          <Highlighter className="h-3.5 w-3.5" />
        </TB>

        <Separator orientation="vertical" className="h-5 mx-1" />

        <TB
          title="Align left"
          pressed={editor.isActive({ textAlign: "left" })}
          onPress={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <AlignLeft className="h-3.5 w-3.5" />
        </TB>
        <TB
          title="Align centre"
          pressed={editor.isActive({ textAlign: "center" })}
          onPress={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <AlignCenter className="h-3.5 w-3.5" />
        </TB>
        <TB
          title="Align right"
          pressed={editor.isActive({ textAlign: "right" })}
          onPress={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <AlignRight className="h-3.5 w-3.5" />
        </TB>

        <Separator orientation="vertical" className="h-5 mx-1" />

        <TB
          title="Bullet list"
          pressed={editor.isActive("bulletList")}
          onPress={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-3.5 w-3.5" />
        </TB>
        <TB
          title="Numbered list"
          pressed={editor.isActive("orderedList")}
          onPress={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </TB>
        <TB
          title="Blockquote"
          pressed={editor.isActive("blockquote")}
          onPress={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-3.5 w-3.5" />
        </TB>
        <TB
          title="Divider"
          onPress={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus className="h-3.5 w-3.5" />
        </TB>

        <Separator orientation="vertical" className="h-5 mx-1" />

        <TB
          title={editor.isActive("link") ? "Edit link" : "Add link"}
          pressed={editor.isActive("link") || showLinkInput}
          onPress={() => {
            setShowLinkInput((p) => !p);
            setShowYoutubeInput(false);
          }}
        >
          <LinkIcon className="h-3.5 w-3.5" />
        </TB>

        <TB
          title="Embed YouTube video"
          pressed={showYoutubeInput}
          onPress={() => {
            setShowYoutubeInput((p) => !p);
            setShowLinkInput(false);
          }}
        >
          <YoutubeIcon className="h-3.5 w-3.5" />
        </TB>
      </div>

      {/* link bar */}
      {showLinkInput && (
        <LinkInputBar
          initial={currentLinkHref}
          onConfirm={(url, newTab) => {
            if (url) {
              editor
                .chain()
                .focus()
                .extendMarkRange("link")
                .setLink({ href: url, target: newTab ? "_blank" : "_self" })
                .run();
            } else {
              editor.chain().focus().unsetLink().run();
            }
            setShowLinkInput(false);
          }}
          onRemove={() => {
            editor.chain().focus().unsetLink().run();
            setShowLinkInput(false);
          }}
        />
      )}

      {/* youtube bar */}
      {showYoutubeInput && (
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/10">
          <YoutubeIcon className="h-4 w-4 text-red-500 shrink-0" />
          <Input
            placeholder="Paste YouTube URL..."
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && insertYoutube()}
            className="h-8 text-sm flex-1"
            autoFocus
          />
          <Button
            type="button"
            size="sm"
            onClick={insertYoutube}
            className="h-8 shrink-0"
          >
            Embed
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 shrink-0"
            onClick={() => setShowYoutubeInput(false)}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {/* ══ BUBBLE MENU ══════════════════════════════════════════════════════ */}
      <BubbleMenu
        editor={editor}
        options={{ placement: "bottom" }}
        shouldShow={({ state }) => {
          const { from, to } = state.selection;
          return from !== to;
        }}
      >
        <div className="flex items-center gap-0.5 bg-popover border border-border rounded-lg px-1.5 py-1 shadow-xl">
          <TB
            title="Bold"
            pressed={editor.isActive("bold")}
            onPress={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="h-3.5 w-3.5" />
          </TB>
          <TB
            title="Italic"
            pressed={editor.isActive("italic")}
            onPress={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="h-3.5 w-3.5" />
          </TB>
          <TB
            title="Underline"
            pressed={editor.isActive("underline")}
            onPress={() => editor.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon className="h-3.5 w-3.5" />
          </TB>
          <TB
            title="Highlight"
            pressed={editor.isActive("highlight")}
            onPress={() => editor.chain().focus().toggleHighlight().run()}
          >
            <Highlighter className="h-3.5 w-3.5" />
          </TB>
          <Separator orientation="vertical" className="h-4 mx-0.5" />
          <TB
            title="Link"
            pressed={editor.isActive("link")}
            onPress={() => setShowLinkInput(true)}
          >
            <LinkIcon className="h-3.5 w-3.5" />
          </TB>
          {editor.isActive("link") && (
            <TB
              title="Remove link"
              onPress={() => editor.chain().focus().unsetLink().run()}
            >
              <Link2Off className="h-3.5 w-3.5" />
            </TB>
          )}
        </div>
      </BubbleMenu>

      {/* ══ EDITOR CONTENT ═══════════════════════════════════════════════════ */}
      <EditorContent editor={editor} />

      {/* ══ FOOTER — markdown tools + word count ════════════════════════════ */}
      <div className="flex items-center justify-between gap-3 px-4 py-2 border-t border-border bg-muted/10 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {/* import markdown via dialog */}
          <MarkdownImportDialog onImport={importMarkdown} />

          {/* convert existing plain explanation — only shown if plainText exists
              and rich content hasn't been set yet */}
          {plainText?.trim() && !content && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-1.5 text-[12px] h-7 text-muted-foreground"
              onClick={convertPlainText}
              title="Convert the existing plain text explanation to rich text"
            >
              <FileText className="h-3.5 w-3.5" />
              Convert from plain text
            </Button>
          )}

          <span className="text-[10px] text-muted-foreground/60 hidden sm:block">
            Tip: type ** for bold, ## for heading, &gt; for quote
          </span>
        </div>

        <span className="text-[11px] text-muted-foreground tabular-nums">
          {editor.getText().split(/\s+/).filter(Boolean).length} words
        </span>
      </div>
    </div>
  );
}
