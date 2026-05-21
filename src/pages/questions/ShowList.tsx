import { useRecordContext, ReferenceField, TextField } from "react-admin";
import { Show } from "@/components/admin/show";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  User,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  HelpCircle,
  Tag,
  FileText,
  Lightbulb,
  Hash,
} from "lucide-react";

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const difficultyConfig: Record<string, { label: string; className: string }> = {
  easy: {
    label: "Easy",
    className:
      "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300",
  },
  medium: {
    label: "Medium",
    className:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300",
  },
  hard: {
    label: "Hard",
    className:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300",
  },
};

const typeConfig: Record<string, { label: string; className: string }> = {
  mcq: {
    label: "Multiple Choice",
    className:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300",
  },
  true_false: {
    label: "True / False",
    className:
      "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-300",
  },
  short_answer: {
    label: "Short Answer",
    className:
      "border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-800 dark:bg-cyan-950 dark:text-cyan-300",
  },
};

// ─── section wrapper ──────────────────────────────────────────────────────────

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide">
          {title}
        </h3>
      </div>
      {children}
      <Separator />
    </div>
  );
}

// ─── meta row ─────────────────────────────────────────────────────────────────

function MetaRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-32 shrink-0 text-[12px] text-muted-foreground pt-0.5">
        {label}
      </span>
      <span className="text-[13px] text-foreground font-medium flex-1">
        {children}
      </span>
    </div>
  );
}

// ─── options field ────────────────────────────────────────────────────────────
// Reads options and correct_answer from record context.
// Highlights the correct answer in green, others in neutral.

function OptionsField() {
  const record = useRecordContext();
  const options: string[] = record?.options ?? [];
  const correct = record?.correct_answer;

  if (!options.length)
    return (
      <span className="text-[13px] text-muted-foreground">No options</span>
    );

  return (
    <div className="flex flex-col gap-2">
      {options.map((opt, i) => (
        <div
          key={i}
          className={cn(
            "flex items-center gap-2.5 rounded-lg border px-3 py-2 text-[13px]",
            opt === correct
              ? "border-green-300 bg-green-50 text-green-800 font-semibold dark:border-green-700 dark:bg-green-950 dark:text-green-300"
              : "border-border bg-muted/30 text-foreground",
          )}
        >
          {opt === correct ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
          ) : (
            <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-border bg-background inline-flex items-center justify-center text-[10px] text-muted-foreground font-bold">
              {i + 1}
            </span>
          )}
          {opt}
          {opt === correct && (
            <Badge
              variant="outline"
              className="ml-auto text-[10px] border-green-300 text-green-700 bg-green-50"
            >
              Correct
            </Badge>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── topics field ─────────────────────────────────────────────────────────────
// Renders each topic as a badge chip.

function TopicsField() {
  const record = useRecordContext();
  const topics: string[] = record?.topics ?? [];

  if (!topics.length)
    return <span className="text-[13px] text-muted-foreground">No topics</span>;

  return (
    <div className="flex flex-wrap gap-1.5">
      {topics.map((topic, i) => (
        <Badge
          key={i}
          variant="secondary"
          className="text-[11px] font-medium rounded-full"
        >
          {topic}
        </Badge>
      ))}
    </div>
  );
}

// ─── main show layout ─────────────────────────────────────────────────────────

function QuestionShowLayout() {
  const record = useRecordContext();

  const difficulty = record?.difficulty;
  const questionType = record?.question_type;
  const isActive = record?.is_active ?? false;

  const diffStyle = difficulty ? difficultyConfig[difficulty] : null;
  const typeStyle = questionType ? typeConfig[questionType] : null;

  return (
    <div className="max-w-2xl space-y-5 p-6">
      {/* ── section 1: identity ── */}
      <Section title="Details" icon={Hash}>
        <div className="space-y-2">
          <MetaRow label="ID">#{record?.id}</MetaRow>
          <MetaRow label="Created">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
              {formatDate(record?.created_at)}
            </span>
          </MetaRow>
          <MetaRow label="Created by">
            {/* ReferenceField works here because Show provides record context */}
            <ReferenceField
              source="created_by"
              reference="profiles"
              link={false}
            >
              <TextField source="full_name" />
            </ReferenceField>
          </MetaRow>
          <MetaRow label="Exam session">
            <ReferenceField
              source="exam_session_id"
              reference="exam_session"
              link={false}
            >
              <TextField source="session_name" />
            </ReferenceField>
          </MetaRow>
          <MetaRow label="Subject">
            <ReferenceField
              source="subject_id"
              reference="subjects"
              link={false}
            >
              <TextField source="name" />
            </ReferenceField>
          </MetaRow>
        </div>
      </Section>

      {/* ── section 2: the question ── */}
      <Section title="Question" icon={HelpCircle}>
        {/* question text — big and prominent */}
        <p className="text-[15px] font-medium text-foreground leading-relaxed">
          {record?.question_text ?? "—"}
        </p>

        {/* type + difficulty + status badges in a row */}
        <div className="flex flex-wrap items-center gap-2 mt-1">
          {typeStyle && (
            <Badge
              variant="outline"
              className={cn(
                "text-[11px] font-semibold rounded-full",
                typeStyle.className,
              )}
            >
              {typeStyle.label}
            </Badge>
          )}
          {diffStyle && (
            <Badge
              variant="outline"
              className={cn(
                "text-[11px] font-semibold rounded-full",
                diffStyle.className,
              )}
            >
              {diffStyle.label}
            </Badge>
          )}
          <Badge
            variant="outline"
            className={cn(
              "text-[11px] font-semibold rounded-full",
              isActive
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-amber-200 bg-amber-50 text-amber-700",
            )}
          >
            {isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      </Section>

      {/* ── section 3: answer details ── */}
      <Section title="Answer" icon={CheckCircle2}>
        {/* for true/false and short_answer, just show correct answer as text */}
        {questionType !== "mcq" ? (
          <div className="space-y-3">
            <MetaRow label="Correct answer">
              <span className="inline-flex items-center gap-1.5 text-green-700 font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {record?.correct_answer ?? "—"}
              </span>
            </MetaRow>
          </div>
        ) : (
          <OptionsField />
        )}

        {record?.explanation && (
          <div className="mt-3 rounded-lg border border-border bg-muted/30 px-4 py-3">
            <div className="flex items-center gap-1.5 mb-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
              <Lightbulb className="h-3 w-3" />
              Explanation
            </div>
            <p className="text-[13px] text-foreground leading-relaxed">
              {record.explanation}
            </p>
          </div>
        )}
      </Section>

      {/* ── section 4: topics ── */}
      <Section title="Topics" icon={Tag}>
        <TopicsField />
      </Section>
    </div>
  );
}

// ─── export ───────────────────────────────────────────────────────────────────

export const QuestionShow = () => (
  <Show>
    <QuestionShowLayout />
  </Show>
);
