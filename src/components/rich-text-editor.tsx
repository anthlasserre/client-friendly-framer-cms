import { useEffect, useState, useRef } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import {
  Bold,
  Italic,
  Link as LinkIcon,
  Quote,
  Code,
  List,
  ListOrdered,
  ChevronDown,
} from "lucide-react";
import { cn } from "~/lib/cn";
import { useT } from "~/lib/i18n-context";

interface Props {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
}

export function RichTextEditor({ value, onChange, disabled }: Props) {
  const t = useT();
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
    ],
    content: value || "",
    editable: !disabled,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose-editor min-h-[140px] w-full rounded-b-md border border-t-0 border-(--color-input) bg-(--color-background) px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-ring)",
      },
    },
    onUpdate: ({ editor: e }) => {
      const html = e.getHTML();
      onChange(html === "<p></p>" ? "" : html);
    },
  });

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [editor, disabled]);

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const next = value || "";
    if (next && next !== current) {
      editor.commands.setContent(next, { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor) {
    return (
      <div className="rounded-md border border-(--color-input) bg-(--color-muted)/30 h-[180px] animate-pulse" />
    );
  }

  return (
    <div className="rounded-md border border-(--color-input) overflow-hidden">
      <Toolbar editor={editor} t={t} disabled={disabled} />
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({
  editor,
  t,
  disabled,
}: {
  editor: Editor;
  t: ReturnType<typeof useT>;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-1 border-b border-(--color-input) bg-(--color-muted)/50 px-2 py-1.5 flex-wrap">
      <HeadingMenu editor={editor} t={t} disabled={disabled} />
      <Divider />
      <TbButton
        active={editor.isActive("bold")}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleBold().run()}
        label={t("richtext.bold")}
      >
        <Bold className="h-4 w-4" />
      </TbButton>
      <TbButton
        active={editor.isActive("italic")}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        label={t("richtext.italic")}
      >
        <Italic className="h-4 w-4" />
      </TbButton>
      <LinkButton editor={editor} t={t} disabled={disabled} />
      <Divider />
      <TbButton
        active={editor.isActive("blockquote")}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        label={t("richtext.quote")}
      >
        <Quote className="h-4 w-4" />
      </TbButton>
      <TbButton
        active={editor.isActive("codeBlock")}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        label={t("richtext.code")}
      >
        <Code className="h-4 w-4" />
      </TbButton>
      <Divider />
      <TbButton
        active={editor.isActive("bulletList")}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        label={t("richtext.bulletList")}
      >
        <List className="h-4 w-4" />
      </TbButton>
      <TbButton
        active={editor.isActive("orderedList")}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        label={t("richtext.orderedList")}
      >
        <ListOrdered className="h-4 w-4" />
      </TbButton>
    </div>
  );
}

function Divider() {
  return <div className="mx-1 h-5 w-px bg-(--color-border)" />;
}

function TbButton({
  children,
  onClick,
  active,
  disabled,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-7 w-7 items-center justify-center rounded-md text-(--color-foreground) transition-colors hover:bg-(--color-background) disabled:pointer-events-none disabled:opacity-50",
        active && "bg-(--color-background) shadow-sm",
      )}
    >
      {children}
    </button>
  );
}

function HeadingMenu({
  editor,
  t,
  disabled,
}: {
  editor: Editor;
  t: ReturnType<typeof useT>;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const current: "p" | "h1" | "h2" | "h3" = editor.isActive("heading", { level: 1 })
    ? "h1"
    : editor.isActive("heading", { level: 2 })
      ? "h2"
      : editor.isActive("heading", { level: 3 })
        ? "h3"
        : "p";
  const label =
    current === "p"
      ? "P"
      : current === "h1"
        ? "H1"
        : current === "h2"
          ? "H2"
          : "H3";

  const setHeading = (level: 1 | 2 | 3 | null) => {
    if (level === null) editor.chain().focus().setParagraph().run();
    else editor.chain().focus().toggleHeading({ level }).run();
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs font-medium hover:bg-(--color-background) disabled:opacity-50"
      >
        {label}
        <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-10 mt-1 w-40 rounded-md border border-(--color-border) bg-(--color-popover) p-1 shadow-md text-sm">
          <MenuItem onClick={() => setHeading(null)} active={current === "p"}>
            {t("richtext.paragraph")}
          </MenuItem>
          <MenuItem onClick={() => setHeading(1)} active={current === "h1"}>
            <span className="text-lg font-semibold">{t("richtext.heading1")}</span>
          </MenuItem>
          <MenuItem onClick={() => setHeading(2)} active={current === "h2"}>
            <span className="text-base font-semibold">{t("richtext.heading2")}</span>
          </MenuItem>
          <MenuItem onClick={() => setHeading(3)} active={current === "h3"}>
            <span className="text-sm font-semibold">{t("richtext.heading3")}</span>
          </MenuItem>
        </div>
      )}
    </div>
  );
}

function MenuItem({
  children,
  onClick,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "block w-full rounded px-2 py-1 text-left hover:bg-(--color-accent)",
        active && "bg-(--color-accent)",
      )}
    >
      {children}
    </button>
  );
}

function LinkButton({
  editor,
  t,
  disabled,
}: {
  editor: Editor;
  t: ReturnType<typeof useT>;
  disabled?: boolean;
}) {
  const onClick = () => {
    const prev = (editor.getAttributes("link") as { href?: string }).href ?? "";
    const url = window.prompt(t("richtext.linkPrompt"), prev);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };
  return (
    <TbButton
      active={editor.isActive("link")}
      disabled={disabled}
      onClick={onClick}
      label={t("richtext.link")}
    >
      <LinkIcon className="h-4 w-4" />
    </TbButton>
  );
}
