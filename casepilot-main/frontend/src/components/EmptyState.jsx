export default function EmptyState({ title, description }) {
  return (
    <div className="rounded-[28px] border border-dashed border-stone-300 bg-white/70 p-8 text-center">
      <h3 className="font-display text-2xl text-ink">{title}</h3>
      <p className="mt-3 text-sm text-stone-600">{description}</p>
    </div>
  );
}
