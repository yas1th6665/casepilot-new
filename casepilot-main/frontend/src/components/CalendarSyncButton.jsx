import { CalendarPlus2, CheckCircle2, LoaderCircle } from "lucide-react";

export default function CalendarSyncButton({ onClick, state = "idle", compact = false }) {
  const labels = {
    idle: "Sync to Calendar",
    loading: "Syncing...",
    success: "Calendar Synced",
    error: "Retry Sync",
    not_configured: "Calendar Not Connected",
  };

  const disabled = state === "loading" || state === "success";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
        state === "success" ? "bg-emerald-100 text-emerald-800" : "",
        state === "not_configured" ? "bg-amber-100 text-amber-800" : "",
        state === "error" ? "bg-red-100 text-red-800" : "",
        state === "idle" || state === "loading" ? "bg-paper text-ink hover:bg-sand" : "",
        disabled ? "cursor-default opacity-90" : "",
      ].join(" ")}
    >
      {state === "loading" ? (
        <LoaderCircle className="h-4 w-4 animate-spin" />
      ) : state === "success" ? (
        <CheckCircle2 className="h-4 w-4" />
      ) : (
        <CalendarPlus2 className="h-4 w-4" />
      )}
      {!compact ? labels[state] || labels.idle : null}
    </button>
  );
}
