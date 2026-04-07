import HearingCard from "../components/HearingCard";
import EmptyState from "../components/EmptyState";
import { useHearingStore } from "../stores/hearingStore";

export default function Hearings() {
  const { hearings } = useHearingStore();

  return (
    <div className="space-y-6">
      <div className="rounded-[36px] border border-stone-200/70 bg-white/85 p-7 shadow-panel">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">Calendar</p>
        <h1 className="mt-2 font-display text-4xl text-ink">Upcoming hearings</h1>
      </div>
      {hearings.length ? hearings.map((hearing) => <HearingCard key={hearing.id} hearing={hearing} />) : <EmptyState title="No hearings found" description="Upcoming hearing records will appear here." />}
    </div>
  );
}
