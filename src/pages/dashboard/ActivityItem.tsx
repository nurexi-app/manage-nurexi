import { Activity } from "@/lib/types/others";
import { timeAgo } from "@/lib/utils";

function activityIcon(type: string): string {
  const map: Record<string, string> = {
    question: "ti-help-circle",
    exam_session: "ti-calendar-event",
    profile: "ti-user",
    subject: "ti-book",
    bundle: "ti-package",
    purchase: "ti-credit-card",
    login: "ti-login",
  };
  return map[type] ?? "ti-activity";
}
// ─── activity item ────────────────────────────────────────────────────────────
function ActivityItem({ item }: { item: Activity }) {
  return (
    <div className={`activity-item ${!item.read ? "unread" : ""}`}>
      <div className="activity-dot">
        <i className={`ti ${activityIcon(item.type)}`} aria-hidden="true" />
      </div>
      <div className="activity-content">
        <p className="activity-title">{item.title || item.action}</p>
        {item.description && (
          <p className="activity-desc">{item.description}</p>
        )}
      </div>
      <span className="activity-time">{timeAgo(item.created_at)}</span>
    </div>
  );
}

export default ActivityItem;
