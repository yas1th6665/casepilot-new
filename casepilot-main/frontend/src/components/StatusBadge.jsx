import { STATUS_COLORS } from "../utils/constants";

export default function StatusBadge({ status = "active" }) {
  const styles = STATUS_COLORS[status] || STATUS_COLORS.active;
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${styles.bg} ${styles.text}`}>
      {String(status).replace("_", " ")}
    </span>
  );
}
