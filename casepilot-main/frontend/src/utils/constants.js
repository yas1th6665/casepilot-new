export const PRIORITY_COLORS = {
  urgent: {
    bg: "bg-red-50",
    border: "border-red-500",
    text: "text-red-700",
    dot: "bg-red-500"
  },
  high: {
    bg: "bg-orange-50",
    border: "border-orange-500",
    text: "text-orange-700",
    dot: "bg-orange-500"
  },
  normal: {
    bg: "bg-yellow-50",
    border: "border-yellow-500",
    text: "text-yellow-700",
    dot: "bg-yellow-500"
  },
  low: {
    bg: "bg-stone-50",
    border: "border-stone-300",
    text: "text-stone-700",
    dot: "bg-stone-400"
  }
};

export const STATUS_COLORS = {
  active: { bg: "bg-emerald-100", text: "text-emerald-800" },
  closed: { bg: "bg-stone-200", text: "text-stone-700" },
  pending: { bg: "bg-amber-100", text: "text-amber-800" },
  in_progress: { bg: "bg-sky-100", text: "text-sky-800" },
  completed: { bg: "bg-emerald-100", text: "text-emerald-800" },
  scheduled: { bg: "bg-blue-100", text: "text-blue-800" }
};

export const NAV_ITEMS = [
  { label: "Dashboard", path: "/" },
  { label: "All Cases", path: "/cases" },
  { label: "Hearings", path: "/hearings" },
  { label: "Tasks", path: "/tasks" },
  { label: "Research", path: "/research" },
  { label: "Files", path: "/files" },
  { label: "Connections", path: "/connections" },
  { label: "Settings", path: "/settings" }
];
