import {
  Create,
  SimpleForm,
  TextInput,
  SelectInput,
  BooleanInput,
  ReferenceInput,
  AutocompleteInput,
  ArrayInput,
  SimpleFormIterator,
} from "@/components/admin";

import { required, FormDataConsumer, useGetIdentity } from "react-admin";
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

const ADMIN_ROLE = import.meta.env.VITE_ROLE_ADMIN;
export const QuestionCreate = () => {
  const { data: identity } = useGetIdentity();

  const transform = (data: any) => ({
    ...data,
    created_by: identity?.id,
    is_active: data.is_active ?? true,
  });

  const roles: string[] = (identity?.roles as string[]) ?? [];
  const isAdmin = roles.includes(ADMIN_ROLE);
  return (
    <Create transform={transform}>
      <SimpleForm>
        {/* Exam Session */}

        <ReferenceInput
          source="exam_session_id"
          reference="exam_session"
          filter={isAdmin ? {} : { created_by: identity?.id }}
        >
          <AutocompleteInput validate={required()} optionText="session_name" />
        </ReferenceInput>

        {/* Subject */}
        <ReferenceInput source="subject_id" reference="subjects">
          <AutocompleteInput validate={required()} optionText="name" />
        </ReferenceInput>

        {/* Question Text */}
        <TextInput
          source="question_text"
          label="Question"
          multiline
          validate={required()}
        />

        {/* Question Type */}
        <SelectInput
          source="question_type"
          label="Question Type"
          choices={questionTypes}
          validate={required()}
        />

        {/* Conditional Options */}
        <FormDataConsumer>
          {({ formData }) =>
            formData.question_type === "mcq" && (
              <ArrayInput
                source="options"
                label="Answer Options"
                validate={required()}
              >
                <SimpleFormIterator>
                  <TextInput source="" label="Option" validate={required()} />
                </SimpleFormIterator>
              </ArrayInput>
            )
          }
        </FormDataConsumer>

        {/* Correct Answer */}
        <TextInput
          source="correct_answer"
          label="Correct Answer"
          validate={required()}
        />

        {/* Explanation */}
        <TextInput source="explanation" label="Explanation" multiline />

        {/* Topics */}
        <ArrayInput source="topics" label="Topics">
          <SimpleFormIterator>
            <TextInput source="" label="Topic" />
          </SimpleFormIterator>
        </ArrayInput>

        {/* Difficulty */}
        <SelectInput
          source="difficulty"
          label="Difficulty"
          choices={difficultyChoices}
          validate={required()}
        />

        {/* Active Toggle */}
        <BooleanInput source="is_active" defaultValue />
      </SimpleForm>
    </Create>
  );
};
