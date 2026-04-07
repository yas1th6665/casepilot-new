import { Link } from "react-router-dom";
import { CalendarClock, Landmark } from "lucide-react";
import { formatIndianDate } from "../utils/dateFormat";
import CalendarSyncButton from "./CalendarSyncButton";

export default function HearingCard({ hearing, syncState = "idle", onSync }) {
  return (
    <div className="rounded-[24px] border border-red-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-red-700">
            <CalendarClock className="h-4 w-4" />
            {formatIndianDate(hearing.hearing_date)} at {hearing.hearing_time}
          </div>
          <h3 className="mt-2 font-display text-lg text-ink">{hearing.case_number}</h3>
          <p className="mt-2 text-sm text-stone-600">{hearing.purpose}</p>
          <p className="mt-3 flex items-center gap-2 text-xs text-stone-500">
            <Landmark className="h-4 w-4" />
            {hearing.court_room || "Court room pending"}
          </p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <Link to={`/cases/${encodeURIComponent(hearing.case_number)}`} className="text-sm font-semibold text-wine">
            View case
          </Link>
          {onSync ? <CalendarSyncButton onClick={onSync} state={syncState} compact /> : null}
        </div>
      </div>
    </div>
  );
}
