import EmptyState from "./EmptyState";
import TimelineEvent from "./TimelineEvent";

export default function CaseTimeline({ caseTitle, caseNumber, events }) {
  if (!events.length) {
    return (
      <EmptyState
        title="No timeline events yet"
        description="As hearings, tasks, and notes collect around this matter, the case journey will appear here."
      />
    );
  }

  return (
    <section className="rounded-[32px] border border-stone-200/70 bg-white/85 p-6 shadow-panel">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">Case Journey</p>
        <h2 className="mt-2 font-display text-3xl text-ink">{caseNumber}</h2>
        <p className="mt-1 text-sm text-stone-600">{caseTitle}</p>
      </div>

      <div>
        {events.map((event, index) => (
          <TimelineEvent
            key={event.id}
            event={event}
            isLast={index === events.length - 1}
          />
        ))}
      </div>
    </section>
  );
}
