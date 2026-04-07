import { PRIORITY_COLORS } from "../utils/constants";

export default function PriorityBadge({ priority = "normal" }) {
  const styles = PRIORITY_COLORS[priority] || PRIORITY_COLORS.normal;
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${styles.bg} ${styles.border} ${styles.text}`}>
      <span className={`h-2 w-2 rounded-full ${styles.dot}`} />
      {priority}
    </span>
  );
}
