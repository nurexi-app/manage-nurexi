// src/pages/questions/QuestionEdit.tsx
// Standard react-admin edit — all fields driven by source as normal.
// Only rich_explanation needs custom state since it's a Tiptap editor.

import {
  required,
  SimpleFormIterator,
  useGetIdentity,
  useRecordContext,
} from "react-admin";
import { useWatch, useFormContext } from "react-hook-form";
import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { HelpCircle, BookOpen, Tag, CheckCircle2 } from "lucide-react";
import {
  ArrayInput,
  AutocompleteInput,
  BooleanInput,
  Edit,
  ReferenceInput,
  SelectInput,
  SimpleForm,
  TextInput,
} from "@/components/admin";
import ExplanationEditor from "@/components/ExplanationEditor";

const ADMIN_ROLE = import.meta.env.VITE_ROLE_ADMIN;

const questionTypes = [
  { id: "mcq", name: "Multiple Choice (MCQ)" },
  { id: "true_false", name: "True / False" },
  { id: "short_answer", name: "Short Answer" },
];

const difficultyChoices = [
  { id: "easy", name: "Easy" },
  { id: "medium", name: "Medium" },
  { id: "hard", name: "Hard" },
];

const trueFalseChoices = [
  { id: "true", name: "True" },
  { id: "false", name: "False" },
];

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

// ─── clears dependent fields when question type changes ───────────────────────

function FormStateCleaner() {
  const { setValue } = useFormContext();
  const questionType = useWatch({ name: "question_type" });

  useEffect(() => {
    if (questionType !== "mcq") setValue("options", null);
    if (questionType === "short_answer") setValue("correct_answer", "");
    else if (questionType === "true_false") setValue("correct_answer", "true");
  }, [questionType, setValue]);

  return null;
}

// ─── options — only renders for mcq ──────────────────────────────────────────

function OptionsInput() {
  const questionType = useWatch({ name: "question_type" });
  if (questionType !== "mcq") return null;
  return (
    <ArrayInput source="options" label="Answer Options" validate={required()}>
      <SimpleFormIterator inline>
        <TextInput source="" label="Option" validate={required()} />
      </SimpleFormIterator>
    </ArrayInput>
  );
}

// ─── correct answer — adapts to question type ─────────────────────────────────

function CorrectAnswerInput() {
  const questionType = useWatch({ name: "question_type" });
  const options = useWatch({ name: "options" }) ?? [];

  if (questionType === "true_false") {
    return (
      <SelectInput
        source="correct_answer"
        label="Correct Answer"
        choices={trueFalseChoices}
        validate={required()}
      />
    );
  }

  if (questionType === "mcq") {
    const choices = options
      .filter((o: any) => o && typeof o === "string" && o.trim() !== "")
      .map((opt: any) => ({ id: opt, name: opt }));

    return choices.length > 0 ? (
      <SelectInput
        source="correct_answer"
        label="Correct Answer"
        choices={choices}
        validate={required()}
        helperText="Select from the options above"
      />
    ) : (
      <TextInput
        source="correct_answer"
        label="Correct Answer"
        validate={required()}
        helperText="Add options above first"
        disabled
      />
    );
  }

  return (
    <TextInput
      source="correct_answer"
      label="Correct Answer"
      validate={required()}
    />
  );
}

// ─── rich explanation field ───────────────────────────────────────────────────
// This is the only field that needs custom state — all others use source.
// useRecordContext() is safe here because this component renders inside
// <Edit> which provides the record context.

function RichExplanationField({
  onChangeRich,
}: {
  onChangeRich: (json: any) => void;
}) {
  const record = useRecordContext();

  // plain explanation from the record — used for the "convert" button
  const plainExplanation = record?.explanation as string | undefined;
  const existingRich = record?.rich_explanation;

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
          Rich Explanation
        </label>
        {!existingRich && (
          <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
            Optional · New
          </span>
        )}
        {existingRich && (
          <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
            ✓ Rich explanation set
          </span>
        )}
      </div>
      <p className="text-[11px] text-muted-foreground">
        Supports bold, headings, bullet points, YouTube embeds and more.
        Learners see this instead of the plain text explanation above. Leave
        blank to keep the plain text explanation.
      </p>
      <a
        href="https://clipy.online/video/lggrc9j4zwlf"
        target="_blank"
        rel="noopener noreferrer"
        className="text-orange-500 underline my-2 block"
      >
        learn how to use Rich Explanation features
      </a>
      <ExplanationEditor
        content={existingRich}
        plainText={plainExplanation}
        onChange={onChangeRich}
      />
    </div>
  );
}

// ─── main edit ────────────────────────────────────────────────────────────────

const QuestionEdit = () => {
  const { data: identity } = useGetIdentity();
  const roles: string[] = (identity?.roles as string[]) ?? [];
  const isAdmin = roles.includes(ADMIN_ROLE);
  const userId = identity?.id as string | undefined;

  // rich_explanation state lives here — seeded via transform, not useRecordContext
  // undefined = not yet decided by the editor (leave whatever is in DB)
  // null = explicitly cleared
  // object = new Tiptap JSON to save
  const [richExplanation, setRichExplanation] = useState<any>(undefined);

  const transform = (data: any) => {
    const result: any = { ...data };
    if (richExplanation !== undefined) {
      result.rich_explanation = richExplanation;
    }
    return result;
  };

  return (
    <Edit transform={transform} actions={false}>
      <SimpleForm className="max-w-2xl space-y-2">
        <FormStateCleaner />

        {/* ── context ── */}
        <FormSection title="Context" icon={BookOpen}>
          <ReferenceInput
            source="exam_session_id"
            reference="exam_session"
            filter={isAdmin ? {} : { created_by: userId }}
          >
            <AutocompleteInput
              optionText="session_name"
              validate={required()}
              label="Exam Session"
            />
          </ReferenceInput>
          <ReferenceInput source="subject_id" reference="subjects">
            <AutocompleteInput
              optionText="name"
              validate={required()}
              label="Subject"
            />
          </ReferenceInput>
        </FormSection>

        {/* ── question ── */}
        <FormSection title="Question" icon={HelpCircle}>
          <TextInput
            source="question_text"
            label="Question"
            multiline
            rows={3}
            validate={required()}
          />
          <div className="grid grid-cols-2 gap-4">
            <SelectInput
              source="question_type"
              label="Question Type"
              choices={questionTypes}
              validate={required()}
            />
            <SelectInput
              source="difficulty"
              label="Difficulty"
              choices={difficultyChoices}
              validate={required()}
            />
          </div>
        </FormSection>

        {/* ── answer ── */}
        <FormSection title="Answer" icon={CheckCircle2}>
          <OptionsInput />
          <CorrectAnswerInput />

          {/* plain explanation — source-driven as normal, untouched */}
          <TextInput
            source="explanation"
            label="Explanation (plain text)"
            multiline
            rows={2}
            helperText="Plain text shown to learners on older versions. Kept as-is for all existing questions."
          />

          {/* rich explanation — only field needing custom state */}
          <RichExplanationField onChangeRich={setRichExplanation} />
        </FormSection>

        {/* ── topics ── */}
        <FormSection title="Topics" icon={Tag}>
          <ArrayInput source="topics" label="Topics">
            <SimpleFormIterator inline>
              <TextInput source="" label="Topic" />
            </SimpleFormIterator>
          </ArrayInput>
        </FormSection>

        {/* ── status ── */}
        <FormSection title="Status" icon={CheckCircle2}>
          <BooleanInput source="is_active" label="Active" />
        </FormSection>
      </SimpleForm>
    </Edit>
  );
};

export default QuestionEdit;
