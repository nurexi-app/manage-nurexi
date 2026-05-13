import {
  DateField,
  RecordField,
  ReferenceField,
  TextField,
} from "@/components/admin";
import { AutocompleteInput } from "@/components/admin/autocomplete-input";
import { BooleanInput } from "@/components/admin/boolean-input";
import { Edit } from "@/components/admin/edit";
import { ReferenceInput } from "@/components/admin/reference-input";
import { SimpleForm } from "@/components/admin/simple-form";
import { TextInput } from "@/components/admin/text-input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Clock, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetIdentity, useRecordContext, useRedirect } from "ra-core";
import { useEffect } from "react";
const ADMIN_ROLE = import.meta.env.VITE_ROLE_ADMIN;

function ApprovalSection() {
  const { data: identity } = useGetIdentity();
  const record = useRecordContext();

  const roles: string[] = (identity?.roles as string[]) ?? [];
  const isAdmin = roles.includes(ADMIN_ROLE);
  const isActive = record?.is_active ?? false;

  return (
    <div className="w-full space-y-3">
      <Separator />

      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <ShieldCheck className="h-4 w-4 text-muted-foreground" />
        Session approval
      </div>

      {isAdmin ? (
        <div
          className={cn(
            "flex items-center justify-between rounded-xl border p-4",
            isActive
              ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/40"
              : "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40",
          )}
        >
          <div className="flex items-center gap-3">
            {isActive ? (
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            ) : (
              <Clock className="h-5 w-5 text-amber-500 dark:text-amber-400" />
            )}
            <div>
              <p className="text-[13px] font-semibold text-foreground">
                {isActive ? "Session is live" : "Session is pending"}
              </p>
              <p className="text-[12px] text-muted-foreground">
                {isActive
                  ? "Learners can access this session."
                  : "Toggle to publish this session for learners."}
              </p>
            </div>
          </div>

          <BooleanInput source="is_active" label="" />
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-4">
          {isActive ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
          ) : (
            <Clock className="h-5 w-5 shrink-0 text-amber-500" />
          )}
          <div>
            <p className="text-[13px] font-medium text-foreground">
              {isActive ? "Session is live" : "Awaiting approval"}
            </p>
            <p className="text-[12px] text-muted-foreground">
              {isActive
                ? "An admin has approved this session."
                : "An admin needs to approve this session before learners can access it."}
            </p>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "ml-auto shrink-0 text-[10px] font-semibold rounded-full",
              isActive
                ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300"
                : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300",
            )}
          >
            {isActive ? "Active" : "Pending"}
          </Badge>
        </div>
      )}
    </div>
  );
}

function OwnershipGuard() {
  const record = useRecordContext();
  const { data: identity } = useGetIdentity();
  const redirect = useRedirect();

  const roles: string[] = (identity?.roles as string[]) ?? [];
  const isAdmin = roles.includes(import.meta.env.VITE_ROLE_ADMIN);

  useEffect(() => {
    if (!record || !identity) return;
    if (!isAdmin && record.created_by !== identity.id) {
      redirect("list", "exam_session");
    }
  }, [record, identity, isAdmin, redirect]);

  return null;
}

// ─── main edit page ───────────────────────────────────────────────────────────
const ExamSessionEdit = () => (
  <Edit>
    <SimpleForm>
      <OwnershipGuard />
      <DateField source="created_at" />

      <ReferenceInput source="exam_id" reference="exams">
        <AutocompleteInput />
      </ReferenceInput>

      <TextInput source="year" />
      <TextInput source="session_name" />

      <RecordField source="created_by">
        <ReferenceField source="created_by" reference="profiles">
          <TextField source="full_name" />
        </ReferenceField>
      </RecordField>

      <ApprovalSection />
    </SimpleForm>
  </Edit>
);

export default ExamSessionEdit;
