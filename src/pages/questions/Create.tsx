import {
  Create,
  SimpleForm,
  TextInput,
  SelectInput,
  ReferenceInput,
  AutocompleteInput,
  ArrayInput,
  SimpleFormIterator,
} from "@/components/admin";
import { required, useGetIdentity } from "react-admin";
import { useWatch } from "react-hook-form";
import { Separator } from "@/components/ui/separator";
import { HelpCircle, BookOpen, Tag, CheckCircle2 } from "lucide-react";

// ─── constants ────────────────────────────────────────────────────────────────

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

// ─── dynamic correct answer input ─────────────────────────────────────────────
//
// useWatch reactively reads the current form values for question_type and options.
// This means as the user types options, the correct_answer dropdown updates live.
// No Supabase schema change needed — correct_answer is still saved as a plain string.
//
function CorrectAnswerInput() {
  const questionType = useWatch({ name: "question_type" });
  const options: string[] = useWatch({ name: "options" }) ?? [];

  // true/false — fixed choices
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

  // mcq — build choices from whatever options the user has typed so far
  if (questionType === "mcq") {
    const validOptions = options.filter(
      (o) => typeof o === "string" && o.trim() !== "",
    );
    const choices = validOptions.map((opt) => ({ id: opt, name: opt }));

    return choices.length > 0 ? (
      <SelectInput
        source="correct_answer"
        label="Correct Answer"
        choices={choices}
        validate={required()}
        helperText="Select from the options you entered above"
      />
    ) : (
      <TextInput
        source="correct_answer"
        label="Correct Answer"
        validate={required()}
        helperText="Add options above first, then select the correct one"
        disabled
      />
    );
  }

  // short_answer — free text
  return (
    <TextInput
      source="correct_answer"
      label="Correct Answer"
      validate={required()}
    />
  );
}

// ─── conditional options input ────────────────────────────────────────────────
//
// useWatch replaces FormDataConsumer — cleaner and more reactive.
// Only renders for MCQ questions.
//
function OptionsInput() {
  const questionType = useWatch({ name: "question_type" });

  if (questionType !== "mcq") return null;

  return (
    <ArrayInput source="options" label="Answer Options" validate={required()}>
      <SimpleFormIterator>
        <TextInput source="" label="Option" validate={required()} />
      </SimpleFormIterator>
    </ArrayInput>
  );
}

// ─── main create ──────────────────────────────────────────────────────────────

export const QuestionCreate = () => {
  const { data: identity } = useGetIdentity();

  const roles: string[] = (identity?.roles as string[]) ?? [];
  const isAdmin = roles.includes(ADMIN_ROLE);

  const userId = identity?.id as string | undefined;

  const transform = (data: any) => ({
    ...data,
    created_by: userId,
    is_active: data.is_active ?? true,
  });

  return (
    <Create transform={transform}>
      <SimpleForm className="max-w-2xl space-y-2">
        {/* ── section 1: context ── */}
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

        {/* ── section 2: question ── */}
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

        {/* ── section 3: answer ── */}
        <FormSection title="Answer" icon={CheckCircle2}>
          {/* options only shown for MCQ — useWatch handles this */}
          <OptionsInput />

          {/* correct answer adapts based on question_type and options */}
          <CorrectAnswerInput />

          <TextInput
            source="explanation"
            label="Explanation"
            multiline
            rows={2}
          />
        </FormSection>

        {/* ── section 4: topics ── */}
        <FormSection title="Topics" icon={Tag}>
          <ArrayInput source="topics" label="Topics">
            <SimpleFormIterator>
              <TextInput source="" label="Topic" />
            </SimpleFormIterator>
          </ArrayInput>
        </FormSection>
      </SimpleForm>
    </Create>
  );
};
