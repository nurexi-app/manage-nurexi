import { required, SimpleFormIterator, useGetIdentity } from "react-admin";
import { useWatch, useFormContext } from "react-hook-form";
import { useEffect } from "react";
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

// ─── state cleaner component ─────────────────────────────────────────────────

function FormStateCleaner() {
  const { setValue } = useFormContext();
  const questionType = useWatch({ name: "question_type" });

  useEffect(() => {
    if (questionType !== "mcq") {
      setValue("options", null); // Set to null to clear out jsonb nicely in Supabase
    }
    if (questionType === "short_answer") {
      setValue("correct_answer", "");
    } else if (questionType === "true_false") {
      setValue("correct_answer", "true");
    }
  }, [questionType, setValue]);

  return null;
}

// ─── dynamic options input ────────────────────────────────────────────────────

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

// ─── dynamic correct answer ───────────────────────────────────────────────────

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
    // Safely parse the 'text' key from your options jsonb structure
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

// ─── main edit ────────────────────────────────────────────────────────────────

const QuestionEdit = () => {
  const { data: identity } = useGetIdentity();
  const roles: string[] = (identity?.roles as string[]) ?? [];
  const isAdmin = roles.includes(ADMIN_ROLE);
  const userId = identity?.id as string | undefined;

  return (
    <Edit>
      <SimpleForm className="max-w-2xl space-y-2">
        <FormStateCleaner />

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
          <OptionsInput />
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
            <SimpleFormIterator inline>
              <TextInput source="" label="Topic" />
            </SimpleFormIterator>
          </ArrayInput>
        </FormSection>

        {/* ── section 5: status ── */}
        <FormSection title="Status" icon={CheckCircle2}>
          <BooleanInput source="is_active" label="Active" />
        </FormSection>
      </SimpleForm>
    </Edit>
  );
};

export default QuestionEdit;
