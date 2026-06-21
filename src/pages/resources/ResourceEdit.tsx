import { required, useGetIdentity, useRecordContext } from "react-admin";
import {
  Edit,
  SimpleForm,
  TextInput,
  SelectInput,
  AutocompleteInput,
  ReferenceInput,
} from "@/components/admin";
import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BookOpen,
  Link as LinkIcon,
  ImageIcon,
  FileText,
  Plus,
  Trash2,
  Globe,
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
  CheckCircle2,
  Clock,
} from "lucide-react";
import ResourceEditor from "@/components/ResourceEditor";
import { cn } from "@/lib/utils";
import { CoverImageField } from "./CoverImageField";

// ─── constants (same as Create) ───────────────────────────────────────────────

const CATEGORIES = [
  { id: "study", name: "Study Resources" },
  { id: "clinical", name: "Clinical Resources" },
  { id: "career", name: "Career Resources" },
  { id: "professional", name: "Professional Development" },
  { id: "community", name: "Community Resources" },
];

const RESOURCE_TYPES = [
  { id: "article", name: "Article" },
  { id: "micro", name: "Micro Post (short, focused)" },
  { id: "video", name: "Video" },
  { id: "guide", name: "Guide / Reference" },
];

const LINK_ICONS = [
  { id: "globe", label: "Website", icon: Globe },
  { id: "instagram", label: "Instagram", icon: Instagram },
  { id: "twitter", label: "Twitter / X", icon: Twitter },
  { id: "youtube", label: "YouTube", icon: Youtube },
  { id: "linkedin", label: "LinkedIn", icon: Linkedin },
  { id: "link", label: "Other", icon: LinkIcon },
];

const ADMIN_ROLE = import.meta.env.VITE_ROLE_ADMIN;

// ─── section wrapper ──────────────────────────────────────────────────────────

function FormSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </span>
      </div>
      {children}
      <Separator />
    </div>
  );
}

// ─── creator links builder ────────────────────────────────────────────────────

interface CreatorLink {
  label: string;
  url: string;
  icon: string;
}

function CreatorLinksField({
  value,
  onChange,
}: {
  value: CreatorLink[];
  onChange: (links: CreatorLink[]) => void;
}) {
  const addLink = () =>
    onChange([...value, { label: "", url: "", icon: "globe" }]);

  const updateLink = (index: number, patch: Partial<CreatorLink>) =>
    onChange(value.map((l, i) => (i === index ? { ...l, ...patch } : l)));

  const removeLink = (index: number) =>
    onChange(value.filter((_, i) => i !== index));

  return (
    <div className="space-y-3">
      {value.map((link, i) => (
        <div
          key={i}
          className="flex items-start gap-2 p-3 rounded-xl border border-border bg-muted/20"
        >
          <select
            value={link.icon}
            onChange={(e) => updateLink(i, { icon: e.target.value })}
            className="h-9 px-2 text-xs border border-input rounded-md bg-background w-28 shrink-0"
          >
            {LINK_ICONS.map((li) => (
              <option key={li.id} value={li.id}>
                {li.label}
              </option>
            ))}
          </select>

          <div className="flex-1 flex flex-col gap-2">
            <Input
              placeholder="Label  e.g. Follow us on Instagram"
              value={link.label}
              onChange={(e) => updateLink(i, { label: e.target.value })}
              className="h-8 text-sm"
            />
            <Input
              placeholder="URL  e.g. https://instagram.com/naijanursesconnect"
              value={link.url}
              onChange={(e) => updateLink(i, { url: e.target.value })}
              className="h-8 text-sm"
              type="url"
            />
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => removeLink(i)}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive shrink-0"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addLink}
        className="gap-1.5 text-[12px]"
        disabled={value.length >= 6}
      >
        <Plus className="h-3.5 w-3.5" />
        Add link {value.length > 0 && `(${value.length}/6)`}
      </Button>
    </div>
  );
}

// ─── status banner (admin only) ───────────────────────────────────────────────
// Admins see the current status and can publish/unpublish inline

function StatusBanner({ isAdmin }: { isAdmin: boolean }) {
  const record = useRecordContext();
  if (!record) return null;

  const status = record.status as string;

  const config = {
    draft: {
      label: "Draft — not visible to the public",
      className:
        "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300",
      icon: Clock,
    },
    pending_review: {
      label: "Pending review — awaiting admin approval",
      className:
        "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300",
      icon: Clock,
    },
    published: {
      label: "Published — live on nurexi.com/resources",
      className:
        "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300",
      icon: CheckCircle2,
    },
  }[status] ?? {
    label: status,
    className: "",
    icon: Clock,
  };

  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-xl border px-4 py-3 text-[13px] font-medium",
        config.className,
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{config.label}</span>

      {/* admin can publish/unpublish directly from edit page */}
      {isAdmin && status === "published" && (
        <Badge
          variant="outline"
          className="ml-auto text-[10px] border-current cursor-default"
        >
          Admin · Can unpublish from list view
        </Badge>
      )}
      {isAdmin && status === "pending_review" && (
        <Badge
          variant="outline"
          className="ml-auto text-[10px] border-current cursor-default"
        >
          Admin · Approve from list view
        </Badge>
      )}
    </div>
  );
}

// ─── inner form — needs record context to seed state ─────────────────────────

// ─── inner form — receives state from parent ─────────────────────────────────

function ResourceEditForm({
  isAdmin,
  editorContent,
  setEditorContent,
  creatorLinks,
  setCreatorLinks,
  coverImage,
  setCoverImage,
}: {
  isAdmin: boolean;
  editorContent: any;
  setEditorContent: (content: any) => void;
  creatorLinks: CreatorLink[];
  setCreatorLinks: (links: CreatorLink[]) => void;
  coverImage: string;
  setCoverImage: (url: string) => void;
}) {
  const record = useRecordContext();
  const { identity } = useGetIdentity();
  const [initialised, setInitialised] = useState(false);

  // seed local state from the loaded record — only once
  useEffect(() => {
    if (!record || initialised) return;
    setCreatorLinks(
      Array.isArray(record.creator_links) ? record.creator_links : [],
    );
    setEditorContent(record.content ?? null);
    setCoverImage(record.cover_image_url || "");
    setInitialised(true);
  }, [record, initialised]);

  if (!record) return null;

  return (
    <SimpleForm className="max-w-3xl space-y-2">
      {/* status banner */}
      <StatusBanner isAdmin={isAdmin} />

      {/* ── classification ── */}
      <FormSection title="Classification" icon={BookOpen}>
        <div className="grid grid-cols-2 gap-4">
          <SelectInput
            source="category"
            label="Category"
            choices={CATEGORIES}
            validate={required()}
          />
          <SelectInput
            source="resource_type"
            label="Resource type"
            choices={RESOURCE_TYPES}
            validate={required()}
          />
        </div>
        <div className="mt-4">
          <ReferenceInput
            source="subject_id"
            reference="subjects"
            label="Related Subject (optional)"
            sort={{ field: "name", order: "ASC" }}
            filter={{ is_active: true }} // Only show active subjects
          >
            <AutocompleteInput
              optionText="name"
              optionValue="id"
              placeholder="Search for a subject..."
              helperText="Link this resource to a specific nursing subject"
            />
          </ReferenceInput>
        </div>
      </FormSection>

      {/* ── content ── */}
      <FormSection title="Content" icon={FileText}>
        <TextInput source="title" label="Title" validate={required()} />
        <TextInput
          source="excerpt"
          label="Excerpt / Summary"
          multiline
          rows={2}
          validate={required()}
          helperText="Shown on listing pages and in search results"
        />

        {/* Tiptap editor — seeded with existing content */}
        <div className="space-y-1.5">
          <Label className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">
            Body content
          </Label>
          {initialised && (
            <ResourceEditor
              content={editorContent}
              onChange={setEditorContent}
              userId={identity?.id as string}
            />
          )}
        </div>
      </FormSection>

      {/* ── cover image ── */}
      <FormSection title="Cover image" icon={ImageIcon}>
        <CoverImageField
          value={coverImage}
          onChange={setCoverImage}
          userId={identity?.id as string}
          className="bg-muted/20 p-3 rounded-xl"
        />
      </FormSection>

      {/* ── creator links ── */}
      <FormSection title="Your links" icon={LinkIcon}>
        <p className="text-[12px] text-muted-foreground -mt-2">
          Links to your social media, website, or WhatsApp channel — shown at
          the bottom of the published resource.
        </p>
        {initialised && (
          <CreatorLinksField value={creatorLinks} onChange={setCreatorLinks} />
        )}
      </FormSection>

      {/* slug — read only, shown for reference */}
      <div className="rounded-xl border border-border bg-muted/20 px-4 py-3 space-y-1">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
          Resource URL
        </p>
        <p className="text-[13px] text-foreground font-mono">
          {import.meta.env.VITE_PUBLIC_APP_URL}/resources/
          <span className="text-primary">{record.slug}</span>
        </p>
        <p className="text-[11px] text-muted-foreground">
          Slug is auto-generated and cannot be changed after creation.
        </p>
      </div>
    </SimpleForm>
  );
}

// ─── exported edit page ───────────────────────────────────────────────────────

export const ResourceEdit = () => {
  const { data: identity } = useGetIdentity();
  const roles: string[] = (identity?.roles as string[]) ?? [];
  const isAdmin = roles.includes(ADMIN_ROLE);

  const [creatorLinks, setCreatorLinks] = useState<CreatorLink[]>([]);
  const [editorContent, setEditorContent] = useState<any>(null);
  const [coverImage, setCoverImage] = useState<string>("");
  return (
    <Edit
      actions={false}
      transform={(data: any) => ({
        ...data,
        content: editorContent,
        creator_links: creatorLinks,
        cover_image_url: coverImage,
      })}
    >
      <ResourceEditForm
        isAdmin={isAdmin}
        editorContent={editorContent}
        setEditorContent={setEditorContent}
        creatorLinks={creatorLinks}
        setCreatorLinks={setCreatorLinks}
        coverImage={coverImage}
        setCoverImage={setCoverImage}
      />
    </Edit>
  );
};
