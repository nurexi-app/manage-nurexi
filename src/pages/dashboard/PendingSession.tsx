import { Badge } from "@/components/ui/badge";
import { PendingSession } from "@/lib/types/others";
import { useRedirect } from "ra-core";

function PendingSessionRow({ session }: { session: PendingSession }) {
  const redirect = useRedirect();
  const label = session.title ?? session.name ?? `Session #${session.id}`;
  const date = new Date(session.created_at).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div
      onClick={() => redirect("edit", "exam_session", session.id)}
      className="flex cursor-pointer items-center gap-3 px-5 py-2.5 transition-colors hover:bg-muted/40 last:border-none"
    >
      <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-amber-400" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium text-foreground">
          {label}
        </p>
        <p className="text-[11px] text-muted-foreground">Created {date}</p>
      </div>
      <Badge
        variant="outline"
        className="shrink-0 border-amber-200 bg-amber-50 text-[10px] font-semibold text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300"
      >
        Pending
      </Badge>
    </div>
  );
}

export default PendingSessionRow;
