const order = { urgent: 0, high: 1, normal: 2, low: 3 };

export function sortByPriority(items = []) {
  return [...items].sort(
    (a, b) =>
      (order[a.priority] ?? 99) - (order[b.priority] ?? 99) ||
      String(a.due_date || a.hearing_date || "").localeCompare(
        String(b.due_date || b.hearing_date || "")
      )
  );
}
