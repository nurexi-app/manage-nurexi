import { List } from "@/components/admin/list";
import {
  RecordContextProvider,
  useListContext,
  useCreatePath,
  useRecordContext,
  ReferenceManyCount,
  useGetIdentity,
  useNotify,
} from "react-admin";
import { Link } from "react-router";
import { cn } from "@/lib/utils";

function SubjectGrid() {
  const { data, isPending } = useListContext();

  const ADMIN_ROLE = import.meta.env.VITE_ROLE_ADMIN;
  const { data: identity } = useGetIdentity();
  const roles: string[] = (identity?.roles as string[]) ?? [];
  const isAdmin = roles.includes(ADMIN_ROLE);

  if (isPending) return <div>loading...</div>;
  if (!data?.length) return <div>no subjects</div>;

  return (
    <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 lg:grid-cols-4">
      {data.map((subject) => (
        <RecordContextProvider key={subject.id} value={subject}>
          <SubjectCard isAdmin={isAdmin} />
        </RecordContextProvider>
      ))}
    </div>
  );
}

function SubjectCard({ isAdmin }: { isAdmin: boolean }) {
  const record = useRecordContext();
  const createPath = useCreatePath();
  const editPath = createPath({
    resource: "subjects",
    id: record?.id,
    type: "edit",
  });
  const DEFAULT_IMAGE = `https://placehold.co/400x200?text=${record?.name ?? "Subject"}`;
  const imageUrl = record?.image ?? DEFAULT_IMAGE;
  const isActive = record?.is_active ?? false;

  const notify = useNotify();
  return (
    <Link
      to={isAdmin ? editPath : "#"}
      onClick={() =>
        !isAdmin &&
        notify("You are not authorized to edit this subject", {
          type: "error",
        })
      }
      className="group no-underline focus:outline-none"
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-xl border border-border",
          "bg-card shadow-sm transition-shadow duration-200 hover:shadow-md",
        )}
      >
        {/* ── image with scale on hover ── */}
        <div className="relative h-32 overflow-hidden">
          <img
            src={imageUrl}
            alt={record?.name ?? "Subject"}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = DEFAULT_IMAGE;
            }} // fallback if URL breaks
          />
          {/* dark gradient overlay so text is readable */}
          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />

          {/* active badge sitting on the image */}
          <span
            className={cn(
              "absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold",
              isActive
                ? "bg-green-500/90 text-white"
                : "bg-amber-400/90 text-white",
            )}
          >
            {isActive ? "Active" : "Inactive"}
          </span>
        </div>

        {/* ── card body ── */}
        <div className="p-3 space-y-1">
          <h4 className="text-base  font-semibold truncate">
            {record?.name}
            {record?.icon && <p className="inline-block pl-1">{record.icon}</p>}
          </h4>
          {record?.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {record.description}
            </p>
          )}
          <div className="flex items-center justify-between text-[12px] text-muted-foreground pt-0.5">
            <div className="flex items-center  gap-1.5">
              <ReferenceManyCount
                reference="questions"
                target="subject_id"
                link
              />
              <span>questions</span>
            </div>

            <p className="text-xs text-muted-foreground">id:{record?.id}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

const SubjectList = () => (
  <List>
    <SubjectGrid />
  </List>
);

export default SubjectList;
