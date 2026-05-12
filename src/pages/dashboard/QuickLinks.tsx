import { Link } from "react-router";
import {
  Plus,
  CalendarPlus,
  List,
  Users,
  BookOpen,
  Package,
  ArrowRight,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ADMIN_ROLE = import.meta.env.VITE_ROLE_ADMIN;
const SUPER_EDUCATOR_ROLE = import.meta.env.VITE_ROLE_SUPER_EDUCATOR;

interface QuickLinkItem {
  to: string;
  icon: LucideIcon;
  label: string;
  roles: string[];
  iconClassName: string;
  iconBgClassName: string;
}

const quickLinks: QuickLinkItem[] = [
  {
    to: "/questions/create",
    icon: Plus,
    label: "Add question",
    roles: [ADMIN_ROLE, SUPER_EDUCATOR_ROLE],
    iconClassName: "text-blue-600",
    iconBgClassName: "bg-blue-50 dark:bg-blue-950",
  },
  {
    to: "/exam_session/create",
    icon: CalendarPlus,
    label: "New exam session",
    roles: [ADMIN_ROLE, SUPER_EDUCATOR_ROLE],
    iconClassName: "text-violet-600",
    iconBgClassName: "bg-violet-50 dark:bg-violet-950",
  },
  {
    to: "/questions",
    icon: List,
    label: "Browse questions",
    roles: [ADMIN_ROLE, SUPER_EDUCATOR_ROLE],
    iconClassName: "text-green-600",
    iconBgClassName: "bg-green-50 dark:bg-green-950",
  },
  {
    to: "/profiles",
    icon: Users,
    label: "Manage users",
    roles: [ADMIN_ROLE],
    iconClassName: "text-cyan-600",
    iconBgClassName: "bg-cyan-50 dark:bg-cyan-950",
  },
  {
    to: "/subjects",
    icon: BookOpen,
    label: "Manage subjects",
    roles: [ADMIN_ROLE],
    iconClassName: "text-red-600",
    iconBgClassName: "bg-red-50 dark:bg-red-950",
  },
  {
    to: "/bundles",
    icon: Package,
    label: "View bundles",
    roles: [ADMIN_ROLE],
    iconClassName: "text-pink-600",
    iconBgClassName: "bg-pink-50 dark:bg-pink-950",
  },
];

interface QuickLinksProps {
  isAdmin: boolean;
  isSuperEducator: boolean;
}

const QuickLinks = ({ isAdmin, isSuperEducator }: QuickLinksProps) => {
  const userRoles: string[] = [];
  if (isAdmin) userRoles.push(ADMIN_ROLE);
  if (isSuperEducator) userRoles.push(SUPER_EDUCATOR_ROLE);

  const visibleLinks = quickLinks.filter((link) =>
    link.roles.some((role) => userRoles.includes(role)),
  );

  return (
    <div className="flex flex-col">
      {visibleLinks.map(
        ({ to, icon: Icon, label, iconClassName, iconBgClassName }) => (
          <Link
            key={to}
            to={to}
            className={cn(
              "group flex items-center gap-2.5 rounded-lg px-2.5 py-2",
              "text-[13px] font-medium text-foreground no-underline",
              "transition-colors hover:bg-muted/60",
            )}
          >
            <span
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                iconBgClassName,
              )}
            >
              <Icon
                className={cn("h-3.5 w-3.5", iconClassName)}
                strokeWidth={2}
              />
            </span>
            <span className="flex-1">{label}</span>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:opacity-80" />
          </Link>
        ),
      )}
    </div>
  );
};

export default QuickLinks;
