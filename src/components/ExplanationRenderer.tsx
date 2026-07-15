import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Youtube from "@tiptap/extension-youtube";
import LinkExt from "@tiptap/extension-link";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { useEffect } from "react";

interface ExplanationRendererProps {
  richExplanation?: any; // jsonb from rich_explanation column
  plainExplanation?: string; // text from explanation column
}

export default function ExplanationRenderer({
  richExplanation,
  plainExplanation,
}: ExplanationRendererProps) {
  const hasRich = richExplanation != null;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ code: false, codeBlock: false }),
      Youtube.configure({ controls: true, nocookie: true }),
      LinkExt.configure({
        openOnClick: true,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Highlight.configure({ multicolor: false }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: hasRich ? richExplanation : null,
    editable: false,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "resource-editor-content resource-content-readonly",
      },
    },
  });

  useEffect(() => {
    if (editor && hasRich) {
      editor.commands.setContent(richExplanation);
    }
  }, [richExplanation]);

  // ── rich explanation ──────────────────────────────────────────────────────
  if (hasRich) {
    if (!editor) return null;
    return <EditorContent editor={editor} />;
  }

  // ── plain text fallback ───────────────────────────────────────────────────
  if (plainExplanation?.trim()) {
    return (
      <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
        {plainExplanation}
      </p>
    );
  }

  return null;
}
