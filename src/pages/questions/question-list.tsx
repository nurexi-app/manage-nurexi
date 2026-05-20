import {
  AutocompleteInput,
  DataTable,
  DateField,
  ReferenceInput,
  TextField,
} from "@/components/admin";
import { List } from "@/components/admin/list";
import { ReferenceField } from "@/components/admin/reference-field";
import { BooleanField } from "react-admin";
import { CreateButton } from "@/components/admin";
import { CustomImportButton } from "@/components/custom/ImportButton";

const ListActions = (props: any) => {
  return (
    <div className="flex gap-2 mb-4">
      <CreateButton />
      <CustomImportButton resource="questions" />
    </div>
  );
};

const ListFilters = [
  <ReferenceInput
    label={"Filter by Session"}
    source="exam_session_id"
    reference="exam_session"
    alwaysOn
  >
    <AutocompleteInput optionText="session_name" optionValue="id" />
  </ReferenceInput>,
];

export const QuestionList = () => (
  <List
    actions={<ListActions />}
    filters={ListFilters}
    sort={{ field: "created_at", order: "DESC" }}
  >
    <DataTable>
      <DataTable.Col source="question_text" />
      <DataTable.Col source="question_type" />
      <DataTable.Col source="exam_session_id">
        <ReferenceField source="exam_session_id" reference="exam_session">
          <TextField source="session_name" />
        </ReferenceField>
      </DataTable.Col>

      <DataTable.Col source="subject_id">
        <ReferenceField source="subject_id" reference="subjects" />
      </DataTable.Col>

      <DataTable.Col source="difficulty" />
      <DataTable.Col source="is_active">
        <BooleanField source="is_active" />
      </DataTable.Col>
      <DataTable.Col source="created_at">
        <DateField source="created_at" />
      </DataTable.Col>
    </DataTable>
  </List>
);
