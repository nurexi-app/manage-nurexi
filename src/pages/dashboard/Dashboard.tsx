import { useEffect, useState } from "react";
import { useGetIdentity, useDataProvider } from "react-admin";
import { Link } from "react-router";
import {
  Users,
  HelpCircle,
  CalendarDays,
  BookOpen,
  Package,
  ClipboardList,
  BarChart3,
  Clock,
  Bell,
  AlertCircle,
  ChevronRight,
  CalendarOff,
} from "lucide-react";
import { greeting } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import QuickLinks from "./QuickLinks";
import StatCard from "./StatCard";
import { PendingSession } from "@/lib/types/others";
import PendingSessionRow from "./PendingSession";

// ─── types ────────────────────────────────────────────────────────────────────
interface DashboardStats {
  totalProfiles?: number;
  totalQuestions?: number;
  totalSessions?: number;
  totalSubjects?: number;
  totalBundles?: number;
  totalExams?: number;
  myQuestions?: number;
  mySessions?: number;
}

interface StatCardProps {
  label: string;
  value: number | undefined;
  icon: React.ElementType;
  iconClassName: string;
  iconBgClassName: string;
  loading?: boolean;
}

const ADMIN_ROLE = import.meta.env.VITE_ROLE_ADMIN;
const SUPER_EDUCATOR_ROLE = import.meta.env.VITE_ROLE_SUPER_EDUCATOR;

// ─── main dashboard ───────────────────────────────────────────────────────────
export const Dashboard = () => {
  const { data: identity } = useGetIdentity();
  const dataProvider = useDataProvider();

  const [stats, setStats] = useState<DashboardStats>({});
  const [pendingSessions, setPendingSessions] = useState<PendingSession[]>([]);
  const [loading, setLoading] = useState(true);

  const roles: string[] = (identity?.roles as string[]) ?? [];
  const isAdmin = roles.includes(ADMIN_ROLE);
  const isSuperEducator = roles.includes(SUPER_EDUCATOR_ROLE);
  const userId = identity?.id as string | undefined;

  const firstName =
    (identity?.fullName as string | undefined)?.split(" ")[0] ?? "there";

  useEffect(() => {
    if (!identity) return;

    const load = async () => {
      try {
        const results: DashboardStats = {};

        if (isAdmin) {
          const [profiles, questions, sessions, subjects, bundles, exams] =
            await Promise.allSettled([
              dataProvider.getList("profiles", {
                pagination: { page: 1, perPage: 1 },
                sort: { field: "id", order: "ASC" },
                filter: {},
              }),
              dataProvider.getList("questions", {
                pagination: { page: 1, perPage: 1 },
                sort: { field: "id", order: "ASC" },
                filter: {},
              }),
              dataProvider.getList("exam_session", {
                pagination: { page: 1, perPage: 1 },
                sort: { field: "id", order: "ASC" },
                filter: {},
              }),
              dataProvider.getList("subjects", {
                pagination: { page: 1, perPage: 1 },
                sort: { field: "id", order: "ASC" },
                filter: {},
              }),
              dataProvider.getList("bundles", {
                pagination: { page: 1, perPage: 1 },
                sort: { field: "id", order: "ASC" },
                filter: {},
              }),
              dataProvider.getList("exams", {
                pagination: { page: 1, perPage: 1 },
                sort: { field: "id", order: "ASC" },
                filter: {},
              }),
            ]);

          if (profiles.status === "fulfilled")
            results.totalProfiles = profiles.value.total ?? 0;
          if (questions.status === "fulfilled")
            results.totalQuestions = questions.value.total ?? 0;
          if (sessions.status === "fulfilled")
            results.totalSessions = sessions.value.total ?? 0;
          if (subjects.status === "fulfilled")
            results.totalSubjects = subjects.value.total ?? 0;
          if (bundles.status === "fulfilled")
            results.totalBundles = bundles.value.total ?? 0;
          if (exams.status === "fulfilled")
            results.totalExams = exams.value.total ?? 0;
        }

        if (isSuperEducator && userId) {
          const [myQ, myS] = await Promise.allSettled([
            dataProvider.getList("questions", {
              pagination: { page: 1, perPage: 1 },
              sort: { field: "id", order: "ASC" },
              filter: { created_by: userId },
            }),
            dataProvider.getList("exam_session", {
              pagination: { page: 1, perPage: 1 },
              sort: { field: "id", order: "ASC" },
              filter: { created_by: userId },
            }),
          ]);
          if (myQ.status === "fulfilled")
            results.myQuestions = myQ.value.total ?? 0;
          if (myS.status === "fulfilled")
            results.mySessions = myS.value.total ?? 0;
        }

        setStats(results);

        // Fetch pending (inactive) exam sessions
        const pendingFilter = isAdmin
          ? { is_active: false }
          : isSuperEducator && userId
            ? { is_active: false, created_by: userId }
            : null;

        if (pendingFilter) {
          try {
            const pendRes = await dataProvider.getList("exam_session", {
              pagination: { page: 1, perPage: 5 },
              sort: { field: "created_at", order: "DESC" },
              filter: pendingFilter,
            });
            setPendingSessions(pendRes.data as PendingSession[]);
          } catch {
            // silently ignore RLS blocks
          }
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [identity, dataProvider, isAdmin, isSuperEducator, userId]);

  const roleLabel = isAdmin
    ? "Administrator"
    : isSuperEducator
      ? "Super Educator"
      : "Educator";

  const statCards: StatCardProps[] = isAdmin
    ? [
        {
          label: "Total users",
          value: stats.totalProfiles,
          icon: Users,
          iconClassName: "text-green-600",
          iconBgClassName: "bg-green-50 dark:bg-green-950",
        },
        {
          label: "Questions",
          value: stats.totalQuestions,
          icon: HelpCircle,
          iconClassName: "text-blue-600",
          iconBgClassName: "bg-blue-50 dark:bg-blue-950",
        },
        {
          label: "Exam sessions",
          value: stats.totalSessions,
          icon: CalendarDays,
          iconClassName: "text-violet-600",
          iconBgClassName: "bg-violet-50 dark:bg-violet-950",
        },
        {
          label: "Subjects",
          value: stats.totalSubjects,
          icon: BookOpen,
          iconClassName: "text-red-600",
          iconBgClassName: "bg-red-50 dark:bg-red-950",
        },
        {
          label: "Bundles",
          value: stats.totalBundles,
          icon: Package,
          iconClassName: "text-pink-600",
          iconBgClassName: "bg-pink-50 dark:bg-pink-950",
        },
        {
          label: "Exams",
          value: stats.totalExams,
          icon: ClipboardList,
          iconClassName: "text-amber-600",
          iconBgClassName: "bg-amber-50 dark:bg-amber-950",
        },
      ]
    : isSuperEducator
      ? [
          {
            label: "My questions",
            value: stats.myQuestions,
            icon: HelpCircle,
            iconClassName: "text-blue-600",
            iconBgClassName: "bg-blue-50 dark:bg-blue-950",
          },
          {
            label: "My sessions",
            value: stats.mySessions,
            icon: CalendarDays,
            iconClassName: "text-violet-600",
            iconBgClassName: "bg-violet-50 dark:bg-violet-950",
          },
        ]
      : [];

  return (
    <div className="max-w-275 p-6 space-y-6">
      {/* ── header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {greeting()}, {firstName} 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening on Nurexi today.
          </p>
        </div>
        <Badge
          variant="outline"
          className="mt-1 rounded-full px-3 py-1 text-xs font-semibold"
        >
          {roleLabel}
        </Badge>
      </div>

      {/* ── stat cards ── */}
      {(loading || statCards.length > 0) && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {loading
            ? [...Array(isAdmin ? 6 : 2)].map((_, i) => (
                <Card key={i} className="flex flex-row items-center gap-3 p-4">
                  <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
                  <div className="flex flex-col gap-1.5 flex-1">
                    <Skeleton className="h-2.5 w-3/5" />
                    <Skeleton className="h-6 w-2/5" />
                  </div>
                </Card>
              ))
            : statCards.map((card) => <StatCard key={card.label} {...card} />)}
        </div>
      )}

      {/* ── two-col body ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_300px] lg:items-start">
        {/* ── LEFT ── */}
        <div className="flex flex-col gap-4">
          {/* pending sessions */}
          {(isAdmin || isSuperEducator) && (
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between border-b px-5 py-3.5">
                <CardTitle className="flex items-center gap-2 text-[13px] font-semibold">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                  Pending exam sessions
                </CardTitle>
                {!loading && pendingSessions.length > 0 && (
                  <Badge
                    variant="outline"
                    className="border-amber-200 bg-amber-50 text-[10px] font-semibold text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300"
                  >
                    {pendingSessions.length}
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex flex-col gap-3 px-5 py-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-2 w-2 shrink-0 rounded-full" />
                        <div className="flex flex-1 flex-col gap-1.5">
                          <Skeleton className="h-3 w-3/5" />
                          <Skeleton className="h-2.5 w-2/5" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : pendingSessions.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 px-5 py-8 text-center">
                    <CalendarOff className="h-6 w-6 text-muted-foreground/30" />
                    <p className="text-[13px] text-muted-foreground">
                      No pending sessions — all caught up!
                    </p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {pendingSessions.map((s) => (
                      <PendingSessionRow key={s.id} session={s} />
                    ))}
                    <div className="px-5 py-2.5">
                      <Link
                        to="/exam_session"
                        className="inline-flex items-center gap-1 text-[12px] font-medium text-primary hover:underline"
                      >
                        View all sessions
                        <ChevronRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* activity — coming soon */}
          <Card className="overflow-hidden">
            <CardHeader className="border-b px-5 py-3.5">
              <CardTitle className="flex items-center gap-2 text-[13px] font-semibold">
                <Bell className="h-3.5 w-3.5" />
                Recent activity
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-3 px-5 py-8 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted">
                <Bell className="h-5 w-5 text-muted-foreground/40" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-foreground">
                  Activity feed coming soon
                </p>
                <p className="mt-0.5 text-[12px] text-muted-foreground leading-relaxed">
                  Track logins, edits, and platform events here.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── RIGHT ── */}
        <div className="flex flex-col gap-4">
          {/* quick actions */}
          <Card>
            <CardHeader className="border-b px-5 py-3.5">
              <CardTitle className="text-[13px] font-semibold">
                Quick actions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <QuickLinks isAdmin={isAdmin} isSuperEducator={isSuperEducator} />
            </CardContent>
          </Card>

          {/* analytics — coming soon */}
          <Card className="border-dashed bg-muted/30">
            <CardHeader className="px-5 py-3.5">
              <CardTitle className="flex items-center gap-2 text-[13px] font-semibold text-muted-foreground">
                <BarChart3 className="h-3.5 w-3.5" />
                Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-4 pt-0">
              <p className="mb-3 text-[12px] text-muted-foreground leading-relaxed">
                Question performance, learner engagement, and purchase analytics
                coming soon.
              </p>
              <div className="flex flex-col gap-1.5">
                {[
                  "Question performance",
                  "Learner engagement",
                  "Purchase analytics",
                  "Audit log",
                ].map((f) => (
                  <div
                    key={f}
                    className="flex items-center gap-2 text-[12px] text-muted-foreground"
                  >
                    <Clock className="h-3 w-3 shrink-0 opacity-60" />
                    {f}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
