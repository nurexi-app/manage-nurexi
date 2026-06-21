import { required, useGetIdentity, useRecordContext } from "react-admin";
import {
  Create,
  SimpleForm,
  TextInput,
  SelectInput,
  AutocompleteInput,
  ReferenceInput,
} from "@/components/admin";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ResourceEditor from "@/components/ResourceEditor";
import { CoverImageField } from "./CoverImageField";

// ─── constants ────────────────────────────────────────────────────────────────

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

// ─── section wrapper (same pattern as questions) ──────────────────────────────

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

  const updateLink = (index: number, patch: Partial<CreatorLink>) => {
    onChange(value.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  };

  const removeLink = (index: number) =>
    onChange(value.filter((_, i) => i !== index));

  return (
    <div className="space-y-3">
      {value.map((link, i) => {
        const IconComp =
          LINK_ICONS.find((li) => li.id === link.icon)?.icon ?? LinkIcon;

        return (
          <div
            key={i}
            className="flex items-start gap-2 p-3 rounded-xl border border-border bg-muted/20"
          >
            {/* icon picker */}
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
        );
      })}

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

// ─── main create page ─────────────────────────────────────────────────────────

export const ResourceCreate = () => {
  const { data: identity } = useGetIdentity();
  const userId = identity?.id as string;
  const record = useRecordContext();
  const [coverImage, setCoverImage] = useState<string>(
    record?.cover_image_url || "",
  );

  const [creatorLinks, setCreatorLinks] = useState<CreatorLink[]>([]);
  const [editorContent, setEditorContent] = useState<any>(null);

  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(
    null,
  );

  const transform = (data: any) => ({
    ...data,
    created_by: userId,
    content: editorContent,
    cover_image_url: coverImage,
    creator_links: creatorLinks,
    status: "pending_review",
  });

  return (
    <Create transform={transform} redirect="list">
      <SimpleForm className="max-w-3xl space-y-2">
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

          {/* Add this below the grid */}
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
          <TextInput
            source="title"
            label="Title"
            validate={required()}
            placeholder="e.g. Drug of the Day — Metronidazole"
          />
          <TextInput
            source="excerpt"
            label="Excerpt / Summary"
            multiline
            rows={2}
            validate={required()}
            placeholder="A short description shown on listing pages and in search results (1-2 sentences)"
          />

          {/* Tiptap editor — passes content up via onChange */}
          <div className="space-y-1.5">
            <Label className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">
              Body content
            </Label>
            <ResourceEditor
              content={editorContent}
              onChange={setEditorContent}
            />
          </div>
        </FormSection>

        {/* ── cover image ── */}

        <FormSection title="Cover image" icon={ImageIcon}>
          <CoverImageField
            value={coverImage}
            onChange={setCoverImage}
            userId={userId}
            className="bg-muted/20 p-3 rounded-xl"
          />
        </FormSection>

        {/* ── creator links ── */}
        <FormSection title="Your links" icon={LinkIcon}>
          <p className="text-[12px] text-muted-foreground -mt-2">
            Add links to your social media, website, or WhatsApp channel. These
            appear at the bottom of your resource so readers can find you.
          </p>
          <CreatorLinksField value={creatorLinks} onChange={setCreatorLinks} />
        </FormSection>

        {/* submission note */}
        <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 px-4 py-3">
          <p className="text-[12px] text-amber-800 dark:text-amber-300 font-medium">
            Your resource will be submitted for review before it goes live. An
            admin will approve and publish it — you'll be notified.
          </p>
        </div>
      </SimpleForm>
    </Create>
  );
};
