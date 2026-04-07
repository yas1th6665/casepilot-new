import { useState } from "react";
import { Plus, X } from "lucide-react";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import TaskCard from "../components/TaskCard";
import { useCaseStore } from "../stores/caseStore";
import { useTaskStore } from "../stores/taskStore";

const TASK_TYPES = [
  { value: "drafting", label: "Drafting" },
  { value: "research", label: "Research" },
  { value: "filing", label: "Filing" },
  { value: "client_communication", label: "Client Communication" },
  { value: "court_visit", label: "Court Visit" },
];

const PRIORITIES = [
  { value: "urgent", label: "Urgent" },
  { value: "high", label: "High" },
  { value: "normal", label: "Normal" },
];

const FILTER_STATUSES = ["all", "pending", "in_progress", "overdue"];

const ASSIGNEE_SUGGESTIONS = ["self", "Junior - Anil", "Junior - Sushma", "Clerk - Ravi", "Paralegal - Meena", "Paralegal - Kiran"];

const DEFAULT_FORM = {
  case_number: "",
  title: "",
  assigned_to: "",
  task_type: "research",
  priority: "normal",
  due_date: "",
  description: "",
};

export default function Tasks() {
  const { tasks, overdueTasks, isLoading, addTask } = useTaskStore();
  const { cases } = useCaseStore();

  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.case_number || !form.title.trim() || !form.assigned_to.trim() || !form.due_date) {
      setSaveError("Please fill in case, title, assigned to, and due date.");
      return;
    }
    setSaving(true);
    setSaveError("");
    try {
      await addTask({
        case_number: form.case_number,
        title: form.title.trim(),
        assigned_to: form.assigned_to.trim(),
        task_type: form.task_type,
        priority: form.priority,
        due_date: form.due_date,
        description: form.description.trim(),
        status: "pending",
      });
      setForm(DEFAULT_FORM);
      setShowForm(false);
    } catch {
      setSaveError("Could not create task. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const applyFilters = (list) => {
    let out = list;
    if (filterPriority !== "all") out = out.filter((t) => t.priority === filterPriority);
    return out;
  };

  const visibleOverdue = filterStatus === "in_progress" ? [] : applyFilters(overdueTasks);
  const visiblePending = (() => {
    if (filterStatus === "overdue") return [];
    let list = applyFilters(tasks);
    if (filterStatus === "pending") list = list.filter((t) => t.status === "pending");
    if (filterStatus === "in_progress") list = list.filter((t) => t.status === "in_progress");
    return list;
  })();

  const totalVisible = visibleOverdue.length + visiblePending.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-[32px] border border-stone-200/70 bg-white/85 p-6 shadow-panel">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-stone-400">Task Board</p>
            <h1 className="mt-1 font-display text-3xl text-ink">Office Workload</h1>
            <p className="mt-1 text-sm text-stone-500">
              {isLoading ? "Loading..." : `${overdueTasks.length} overdue · ${tasks.length} pending/in-progress`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => { setShowForm(true); setSaveError(""); }}
            className="inline-flex items-center gap-2 rounded-full bg-[#24286f] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brass"
          >
            <Plus className="h-4 w-4" />
            New Task
          </button>
        </div>

        {/* Filters */}
        <div className="mt-5 flex flex-wrap gap-2">
          {/* Status filter */}
          <div className="flex rounded-2xl border border-stone-200 bg-paper p-1 gap-1">
            {FILTER_STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFilterStatus(s)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold capitalize transition ${
                  filterStatus === s ? "bg-[#24286f] text-white" : "text-stone-600 hover:text-ink"
                }`}
              >
                {s === "all" ? "All" : s === "in_progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          {/* Priority filter */}
          <div className="flex rounded-2xl border border-stone-200 bg-paper p-1 gap-1">
            <button
              type="button"
              onClick={() => setFilterPriority("all")}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${filterPriority === "all" ? "bg-[#24286f] text-white" : "text-stone-600 hover:text-ink"}`}
            >
              Any Priority
            </button>
            {PRIORITIES.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setFilterPriority(p.value)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${filterPriority === p.value ? "bg-[#24286f] text-white" : "text-stone-600 hover:text-ink"}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {isLoading && <LoadingSpinner label="Loading tasks..." />}

      {!isLoading && totalVisible === 0 && (
        <EmptyState title="No tasks match your filters" description="Try changing the filter or create a new task." />
      )}

      {/* Overdue */}
      {!isLoading && visibleOverdue.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-xl text-red-700">Overdue</h2>
            <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700">
              {visibleOverdue.length}
            </span>
          </div>
          {visibleOverdue.map((task) => <TaskCard key={task.id} task={task} />)}
        </section>
      )}

      {/* Pending / In Progress */}
      {!isLoading && visiblePending.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-xl text-ink">
              {filterStatus === "in_progress" ? "In Progress" : "Pending & In Progress"}
            </h2>
            <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-bold text-stone-600">
              {visiblePending.length}
            </span>
          </div>
          {visiblePending.map((task) => <TaskCard key={task.id} task={task} />)}
        </section>
      )}

      {/* New Task slide-over */}
      {showForm && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={() => setShowForm(false)}
          />

          {/* Drawer */}
          <aside className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-stone-200 bg-white shadow-2xl">
            {/* Drawer header */}
            <div className="flex items-center justify-between border-b border-stone-100 px-6 py-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-stone-400">New Task</p>
                <h2 className="mt-0.5 font-display text-xl text-ink">Assign work</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-full p-2 text-stone-400 transition hover:bg-stone-100 hover:text-ink"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-y-auto">
              <div className="flex-1 space-y-5 px-6 py-6">

                {/* Case */}
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-[0.15em] text-stone-500">Case *</span>
                  <select
                    value={form.case_number}
                    onChange={(e) => setField("case_number", e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-ink outline-none focus:border-brass focus:ring-4 focus:ring-brass/5"
                    required
                  >
                    <option value="">Select a case</option>
                    {cases.map((c) => (
                      <option key={c.id || c.case_number} value={c.case_number}>
                        {c.case_number} — {c.case_title}
                      </option>
                    ))}
                  </select>
                </label>

                {/* Title */}
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-[0.15em] text-stone-500">Task Title *</span>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setField("title", e.target.value)}
                    placeholder="e.g. Prepare written arguments"
                    className="mt-2 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-brass focus:ring-4 focus:ring-brass/5"
                    required
                  />
                </label>

                {/* Assigned to */}
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-[0.15em] text-stone-500">Assign To *</span>
                  <input
                    type="text"
                    list="assignee-suggestions"
                    value={form.assigned_to}
                    onChange={(e) => setField("assigned_to", e.target.value)}
                    placeholder="self, Junior - Anil, Clerk - Ravi…"
                    className="mt-2 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-brass focus:ring-4 focus:ring-brass/5"
                    required
                  />
                  <datalist id="assignee-suggestions">
                    {ASSIGNEE_SUGGESTIONS.map((a) => <option key={a} value={a} />)}
                  </datalist>
                </label>

                {/* Task type + Priority row */}
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-xs font-bold uppercase tracking-[0.15em] text-stone-500">Type</span>
                    <select
                      value={form.task_type}
                      onChange={(e) => setField("task_type", e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-stone-200 bg-white px-3 py-3 text-sm outline-none focus:border-brass focus:ring-4 focus:ring-brass/5"
                    >
                      {TASK_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold uppercase tracking-[0.15em] text-stone-500">Priority</span>
                    <select
                      value={form.priority}
                      onChange={(e) => setField("priority", e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-stone-200 bg-white px-3 py-3 text-sm outline-none focus:border-brass focus:ring-4 focus:ring-brass/5"
                    >
                      {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                  </label>
                </div>

                {/* Due date */}
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-[0.15em] text-stone-500">Due Date *</span>
                  <input
                    type="date"
                    value={form.due_date}
                    onChange={(e) => setField("due_date", e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-brass focus:ring-4 focus:ring-brass/5"
                    required
                  />
                </label>

                {/* Description */}
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-[0.15em] text-stone-500">Notes (optional)</span>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setField("description", e.target.value)}
                    placeholder="Any context or instructions…"
                    className="mt-2 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-brass focus:ring-4 focus:ring-brass/5"
                  />
                </label>

                {saveError && (
                  <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{saveError}</p>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-stone-100 px-6 py-5">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 rounded-full border border-stone-200 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 rounded-full bg-[#24286f] py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brass disabled:opacity-50"
                  >
                    {saving ? "Creating…" : "Create Task"}
                  </button>
                </div>
              </div>
            </form>
          </aside>
        </>
      )}
    </div>
  );
}
