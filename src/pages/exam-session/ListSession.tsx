import {
  useListContext,
  useCreatePath,
  ReferenceField,
  TextField,
  RecordContextProvider,
} from "react-admin";
import { Link } from "react-router";
import { List } from "@/components/admin/list";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CalendarDays,
  User,
  BookOpen,
  Hash,
  Clock,
  HelpCircle,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { ReferenceManyCount } from "@/components/admin";

// ─── types ────────────────────────────────────────────────────────────────────
interface ExamSession {
  id: number | string;
  session_name?: string;
  year?: string | number;
  exam_id?: number | string;
  created_by?: string;
  created_at?: string;
  is_active?: boolean;
}

// ─── single session card ──────────────────────────────────────────────────────
function SessionCard({ session }: { session: ExamSession }) {
  const createPath = useCreatePath();
  const editPath = createPath({
    resource: "exam_session",
    id: session.id,
    type: "edit",
  });

  return (
    <Link to={editPath} className="no-underline focus:outline-none group">
      <Card
        className={cn(
          "h-full overflow-hidden transition-all duration-150",
          "hover:shadow-md hover:-translate-y-0.5",
          "border border-border",
        )}
      >
        {/* coloured top strip based on active state */}
        <div
          className={cn(
            "h-1 w-full",
            session.is_active ? "bg-green-500" : "bg-amber-400",
          )}
        />

        <CardContent className="p-4 flex flex-col gap-3">
          {/* title row */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-[14px] font-semibold text-foreground leading-snug line-clamp-2 flex-1">
              {session.session_name ?? `Session #${session.id}`}
            </h3>
            <Badge
              variant="outline"
              className={cn(
                "shrink-0 text-[10px] font-semibold rounded-full",
                session.is_active
                  ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300"
                  : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300",
              )}
            >
              {session.is_active ? "Active" : "Pending"}
            </Badge>
          </div>

          {/* meta rows */}
          <div className="flex flex-col gap-1.5">
            {/* year */}
            {session.year && (
              <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                <Hash className="h-3 w-3 shrink-0" />
                <span>{session.year}</span>
              </div>
            )}

            {/* exam reference */}
            {session.exam_id && (
              <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                <BookOpen className="h-3 w-3 shrink-0" />
                <span className="truncate">
                  <InlineExamName examId={session.exam_id} />
                </span>
              </div>
            )}

            {/* created by */}
            {session.created_by && (
              <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                <User className="h-3 w-3 shrink-0" />
                <span className="truncate">
                  <InlineCreatorName createdBy={session.created_by} />
                </span>
              </div>
            )}
            {/* question count */}
            <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
              <HelpCircle className="h-3 w-3 shrink-0" />
              <ReferenceManyCount
                reference="questions"
                target="exam_session_id"
              />
              <span>questions</span>
            </div>
            {/* created at */}
            <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
              <Clock className="h-3 w-3 shrink-0" />
              <span>{formatDate(session.created_at)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function InlineExamName({ examId }: { examId: string | number }) {
  // We use a mini record context trick — render a ReferenceField with a fake record
  return (
    <ReferenceFieldValue
      source="exam_id"
      reference="exams"
      recordId={examId}
      displaySource="name"
    />
  );
}

function InlineCreatorName({ createdBy }: { createdBy: string }) {
  return (
    <ReferenceFieldValue
      source="created_by"
      reference="profiles"
      recordId={createdBy}
      displaySource="full_name"
    />
  );
}

// A tiny wrapper that gives ReferenceField a synthetic record context
function ReferenceFieldValue({
  source,
  reference,
  recordId,
  displaySource,
}: {
  source: string;
  reference: string;
  recordId: string | number;
  displaySource: string;
}) {
  const syntheticRecord = { id: "synthetic", [source]: recordId };
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <ReferenceField
      source={source}
      reference={reference}
      record={syntheticRecord as any}
      link={false}
    >
      <TextField source={displaySource} />
    </ReferenceField>
  );
}

// ─── skeleton card ────────────────────────────────────────────────────────────
function SessionCardSkeleton() {
  return (
    <Card className="overflow-hidden border border-border">
      <div className="h-1 w-full bg-muted" />
      <CardContent className="p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-14 rounded-full" />
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-2/5" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── grid ─────────────────────────────────────────────────────────────────────
function SessionGrid() {
  const { data, isPending } = useListContext<ExamSession>();

  if (isPending) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 p-4">
        {[...Array(8)].map((_, i) => (
          <SessionCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <CalendarDays className="h-10 w-10 text-muted-foreground/25" />
        <p className="text-sm font-medium text-muted-foreground">
          No exam sessions found
        </p>
        <p className="text-xs text-muted-foreground/70">
          Create one to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 p-4">
      {data.map((session) => (
        <RecordContextProvider key={session.id} value={session}>
          <SessionCard session={session} />
        </RecordContextProvider>
      ))}
    </div>
  );
}

// ─── exported list ────────────────────────────────────────────────────────────
export const ExamSessionList = () => (
  <List>
    <SessionGrid />
  </List>
);
