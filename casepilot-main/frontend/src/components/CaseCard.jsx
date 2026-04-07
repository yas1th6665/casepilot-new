import { Link } from "react-router-dom";
import PriorityBadge from "./PriorityBadge";
import StatusBadge from "./StatusBadge";
import { formatIndianDate } from "../utils/dateFormat";

export default function CaseCard({ caseItem }) {
  return (
    <Link
      to={`/cases/${encodeURIComponent(caseItem.case_number)}`}
      className="group rounded-[28px] border border-stone-200 bg-white/90 p-5 shadow-panel transition hover:-translate-y-1 hover:border-brass/40"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500">{caseItem.case_number}</p>
          <h3 className="mt-2 font-display text-xl text-ink">{caseItem.case_title}</h3>
          <p className="mt-2 text-sm text-stone-600">{caseItem.court_name}</p>
        </div>
        <PriorityBadge priority={caseItem.priority} />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <StatusBadge status={caseItem.status} />
        <span className="rounded-full bg-sand px-3 py-1 text-xs font-medium text-ink">{caseItem.case_type}</span>
        <span className="text-xs text-stone-500">Filed {formatIndianDate(caseItem.filing_date)}</span>
      </div>
      <p className="mt-4 text-sm text-stone-700">Client: {caseItem.client_name}</p>
    </Link>
  );
}
