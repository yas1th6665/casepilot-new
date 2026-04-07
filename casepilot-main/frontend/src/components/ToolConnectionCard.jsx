import { AlertTriangle, CheckCircle2, CircleDashed, Link2, LogOut } from "lucide-react";

function normalizeStatus(status) {
  if (status === "success") return "connected";
  if (status === "not_configured") return "disconnected";
  return status || "disconnected";
}

function statusMeta(status) {
  const value = normalizeStatus(status);
  if (value === "connected") {
    return {
      label: "Connected",
      tone: "bg-emerald-50 text-emerald-800 border-emerald-200",
      Icon: CheckCircle2,
    };
  }
  if (value === "configured") {
    return {
      label: "Server Ready",
      tone: "bg-amber-50 text-amber-800 border-amber-200",
      Icon: CheckCircle2,
    };
  }
  if (value === "error") {
    return {
      label: "Error",
      tone: "bg-red-50 text-red-800 border-red-200",
      Icon: AlertTriangle,
    };
  }
  return {
    label: "Disconnected",
    tone: "bg-stone-100 text-stone-700 border-stone-200",
    Icon: CircleDashed,
  };
}

export default function ToolConnectionCard({ tool, onReconnect, onConnect, onDisconnect, actionBusy }) {
  const meta = statusMeta(tool.status);
  const StatusIcon = meta.Icon;
  const showConnect = typeof onConnect === "function";
  const showDisconnect = typeof onDisconnect === "function" && normalizeStatus(tool.status) === "connected";
  const connectLabel = normalizeStatus(tool.status) === "configured" ? "Connect Your Account" : "Connect";

  return (
    <article className="rounded-[28px] border border-stone-200/70 bg-white/90 p-6 shadow-panel">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">{tool.label}</p>
          <h2 className="mt-2 font-display text-2xl text-ink">{tool.title}</h2>
          <p className="mt-2 text-sm leading-6 text-stone-600">{tool.description}</p>
        </div>
        <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] ${meta.tone}`}>
          <StatusIcon className="h-4 w-4" />
          {meta.label}
        </span>
      </div>

      <div className="mt-5 space-y-2 text-sm text-stone-700">
        {tool.details?.map((detail) => (
          <p key={detail}>{detail}</p>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <p className="text-xs uppercase tracking-[0.16em] text-stone-500">{tool.footer}</p>
        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          {showConnect ? (
            <button
              type="button"
              onClick={onConnect}
              disabled={actionBusy}
              className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Link2 className="h-4 w-4" />
              {actionBusy ? "Connecting..." : connectLabel}
            </button>
          ) : null}
          {showDisconnect ? (
            <button
              type="button"
              onClick={onDisconnect}
              disabled={actionBusy}
              className="inline-flex items-center gap-2 rounded-full border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogOut className="h-4 w-4" />
              Disconnect
            </button>
          ) : null}
          <button
            type="button"
            onClick={onReconnect}
            className="inline-flex items-center gap-2 rounded-full bg-paper px-4 py-2 text-sm font-semibold text-ink"
          >
            <Link2 className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>
    </article>
  );
}
