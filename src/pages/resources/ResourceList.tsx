import {
  useListContext,
  useGetIdentity,
  useUpdate,
  useRedirect,
  RecordContextProvider,
} from "react-admin";
import { List } from "@/components/admin/list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, CheckCircle2, FileText, Pencil, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const ADMIN_ROLE = import.meta.env.VITE_ROLE_ADMIN;

// ─── status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const config = {
    draft: {
      label: "Draft",
      className:
        "border-gray-200 bg-gray-50 text-gray-600 dark:border-gray-700 dark:bg-gray-900",
    },
    pending_review: {
      label: "Pending review",
      className:
        "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950",
    },
    published: {
      label: "Published",
      className:
        "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950",
    },
  }[status] ?? { label: status, className: "" };

  return (
    <Badge
      variant="outline"
      className={cn("text-[10px] font-semibold rounded-full", config.className)}
    >
      {config.label}
    </Badge>
  );
}

// ─── category label ───────────────────────────────────────────────────────────
const CATEGORY_LABELS: Record<string, string> = {
  study: "Study",
  clinical: "Clinical",
  career: "Career",
  professional: "Professional Dev",
  community: "Community",
};

// ─── resource card ────────────────────────────────────────────────────────────
function ResourceCard({
  resource,
  isAdmin,
}: {
  resource: any;
  isAdmin: boolean;
}) {
  const redirect = useRedirect();
  const [update, { isPending }] = useUpdate();

  const handlePublish = () => {
    update("resources", {
      id: resource.id,
      data: { status: "published" },
      previousData: resource,
    });
  };

  const handleUnpublish = () => {
    update("resources", {
      id: resource.id,
      data: { status: "draft" },
      previousData: resource,
    });
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-sm transition-shadow">
      {/* cover image strip */}
      {resource.cover_image_url ? (
        <div className="h-28 overflow-hidden">
          <img
            src={resource.cover_image_url}
            alt={resource.title}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="h-12 bg-linear-to-r from-primary/10 to-primary/5" />
      )}

      <div className="p-4 space-y-3">
        {/* badges row */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <StatusBadge status={resource.status} />
          <Badge
            variant="secondary"
            className="text-[10px] font-medium rounded-full"
          >
            {CATEGORY_LABELS[resource.category] ?? resource.category}
          </Badge>
          <Badge
            variant="outline"
            className="text-[10px] rounded-full capitalize"
          >
            {resource.resource_type}
          </Badge>
        </div>

        {/* title */}
        <h3 className="text-[14px] font-semibold text-foreground leading-snug line-clamp-2">
          {resource.title || "Untitled resource"}
        </h3>

        {/* excerpt */}
        {resource.excerpt && (
          <p className="text-[12px] text-muted-foreground line-clamp-2 leading-relaxed">
            {resource.excerpt}
          </p>
        )}

        {/* meta */}
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <Clock className="h-3 w-3 shrink-0" />
          <span>{formatDate(resource.created_at)}</span>
        </div>

        {/* actions */}
        <div className="flex items-center gap-2 pt-1 border-t border-border/50 flex-wrap">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 gap-1 text-[12px]"
            onClick={() => redirect("edit", "resources", resource.id)}
          >
            <Pencil className="h-3 w-3" />
            Edit
          </Button>

          {resource.status === "published" && (
            <a
              href={`${import.meta.env.VITE_PUBLIC_APP_URL}/resources/${resource.slug}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="sm"
                variant="ghost"
                className="h-7 gap-1 text-[12px]"
              >
                <Globe className="h-3 w-3" />
                View live
              </Button>
            </a>
          )}

          {/* admin-only approval controls */}
          {isAdmin && (
            <>
              {resource.status === "pending_review" && (
                <Button
                  size="sm"
                  className="h-7 gap-1 text-[12px] ml-auto bg-green-600 hover:bg-green-700"
                  onClick={handlePublish}
                  disabled={isPending}
                >
                  <CheckCircle2 className="h-3 w-3" />
                  Approve & publish
                </Button>
              )}
              {resource.status === "published" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 gap-1 text-[12px] ml-auto"
                  onClick={handleUnpublish}
                  disabled={isPending}
                >
                  Unpublish
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── grid ─────────────────────────────────────────────────────────────────────
function ResourceGrid({ isAdmin }: { isAdmin: boolean }) {
  const { data, isPending } = useListContext();

  if (isPending) {
    return (
      <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border overflow-hidden"
          >
            <Skeleton className="h-28 w-full rounded-none" />
            <div className="p-4 space-y-3">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <FileText className="h-10 w-10 text-muted-foreground/25" />
        <p className="text-sm font-medium text-muted-foreground">
          No resources yet
        </p>
        <p className="text-xs text-muted-foreground/70">
          Create your first resource to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((resource) => (
        <RecordContextProvider key={resource.id} value={resource}>
          <ResourceCard resource={resource} isAdmin={isAdmin} />
        </RecordContextProvider>
      ))}
    </div>
  );
}

// ─── exported list ────────────────────────────────────────────────────────────
export const ResourceList = () => {
  const { data: identity } = useGetIdentity();
  const roles: string[] = (identity?.roles as string[]) ?? [];
  const isAdmin = roles.includes(ADMIN_ROLE);

  return (
    <List sort={{ field: "created_at", order: "DESC" }} filters={[]}>
      <ResourceGrid isAdmin={isAdmin} />
    </List>
  );
};
