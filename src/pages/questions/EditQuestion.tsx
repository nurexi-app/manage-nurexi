import {
  ArrayInput,
  RecordField,
  ReferenceField,
  SimpleFormIterator,
  TextField,
} from "@/components/admin";
import { AutocompleteInput } from "@/components/admin/autocomplete-input";
import { BooleanInput } from "@/components/admin/boolean-input";
import { Edit } from "@/components/admin/edit";
import { ReferenceInput } from "@/components/admin/reference-input";
import { SimpleForm } from "@/components/admin/simple-form";
import { TextInput } from "@/components/admin/text-input";

const QuestionEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="id" />
      <TextInput source="created_at" />
      <ReferenceField source="exam_session_id" reference="exam_session">
        <TextField source="session_name" />
      </ReferenceField>
      <ReferenceInput source="subject_id" reference="subjects">
        <AutocompleteInput />
      </ReferenceInput>
      <TextInput source="question_text" />
      <TextInput source="question_type" />
      <TextInput source="correct_answer" />
      <TextInput source="explanation" />
      <TextInput source="difficulty" />
      <BooleanInput source="is_active" />
      <TextInput source="options" />
      <ArrayInput source="topics" label="Topics">
        <SimpleFormIterator>
          <TextInput source="" label="Topic" />
        </SimpleFormIterator>
      </ArrayInput>
    </SimpleForm>
  </Edit>
);

export default QuestionEdit;
