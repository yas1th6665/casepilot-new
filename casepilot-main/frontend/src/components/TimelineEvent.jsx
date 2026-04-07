import { formatHumanDate } from "../utils/dateFormat";

export default function TimelineEvent({ event, isLast }) {
  return (
    <div className="grid grid-cols-[110px_28px_minmax(0,1fr)] gap-4">
      <div className="pt-1 text-right">
        <p className="text-sm font-semibold text-ink">{formatHumanDate(event.date)}</p>
        {event.isFuture ? (
          <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-orange-600">Upcoming</p>
        ) : null}
      </div>

      <div className="relative flex justify-center">
        <span
          className={`relative z-10 mt-1 h-4 w-4 rounded-full border-4 border-white ${event.isFuture ? "bg-white ring-2 ring-orange-400" : event.styles.dot}`}
        />
        {!isLast ? <span className="absolute top-5 h-full w-px bg-stone-300" /> : null}
      </div>

      <div className={`mb-6 rounded-[24px] border px-5 py-4 shadow-sm ${event.styles.tone}`}>
        <p className="text-xs font-bold uppercase tracking-[0.18em]">{event.type.replaceAll("_", " ")}</p>
        <h3 className="mt-2 font-display text-2xl text-ink">{event.title}</h3>
        <p className="mt-2 text-sm leading-6 text-stone-700">{event.description}</p>
      </div>
    </div>
  );
}
