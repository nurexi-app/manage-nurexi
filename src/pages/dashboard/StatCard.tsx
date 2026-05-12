import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number | undefined;
  icon: React.ElementType;
  iconClassName: string;
  iconBgClassName: string;
  loading?: boolean;
}

function StatCard({
  label,
  value,
  icon: Icon,
  iconClassName,
  iconBgClassName,
  loading,
}: StatCardProps) {
  return (
    <Card className="flex flex-row items-center gap-3 p-4 transition-shadow hover:shadow-sm">
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          iconBgClassName,
        )}
      >
        <Icon className={cn("h-4.5 w-4.5", iconClassName)} strokeWidth={1.75} />
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-[11px] font-medium text-muted-foreground leading-tight">
          {label}
        </span>
        {loading ? (
          <Skeleton className="h-6 w-12 mt-0.5" />
        ) : (
          <span className="text-[22px] font-bold text-foreground leading-none tracking-tight">
            {value === undefined ? "—" : value.toLocaleString()}
          </span>
        )}
      </div>
    </Card>
  );
}
export default StatCard;
