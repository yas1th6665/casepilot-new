import { useEffect, useState } from "react";
import { AlertCircle, CalendarDays, CheckCircle2, FolderOpenDot, TimerReset, Workflow } from "lucide-react";
import CalendarSyncButton from "../components/CalendarSyncButton";
import HearingCard from "../components/HearingCard";
import LoadingSpinner from "../components/LoadingSpinner";
import TaskCard from "../components/TaskCard";
import TaskSyncButton from "../components/TaskSyncButton";
import { api } from "../services/api";
import { formatHumanDate } from "../utils/dateFormat";
import { useSettingsStore } from "../stores/settingsStore";

const statConfig = [
  { key: "active_cases",   label: "Active Cases",   icon: FolderOpenDot },
  { key: "hearings_today", label: "Today",          icon: CalendarDays },
  { key: "overdue_tasks",  label: "Overdue",        icon: TimerReset },
  { key: "pending_tasks",  label: "Pending",        icon: Workflow },
];

export default function Dashboard() {
  const { advocateName } = useSettingsStore();
  const [brief, setBrief] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bulkCalendarState, setBulkCalendarState] = useState("idle");
  const [bulkTaskState, setBulkTaskState] = useState("idle");
  const [hearingSyncStates, setHearingSyncStates] = useState({});
  const [taskSyncStates, setTaskSyncStates] = useState({});

  useEffect(() => {
    let mounted = true;
    api.getBrief().then((data) => {
      if (mounted) setBrief(data);
    }).finally(() => {
      if (mounted) setIsLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  if (isLoading) return <LoadingSpinner label="Preparing the morning brief..." />;
  if (!brief) return <div className="text-sm text-stone-600">Unable to load the dashboard brief.</div>;

  const syncHearing = async (hearingId) => {
    setHearingSyncStates((s) => ({ ...s, [hearingId]: "loading" }));
    try {
      const result = await api.syncHearingToCalendar(hearingId);
      setHearingSyncStates((s) => ({ ...s, [hearingId]: result.status === "success" ? "success" : result.status }));
    } catch {
      setHearingSyncStates((s) => ({ ...s, [hearingId]: "error" }));
    }
  };

  const syncTask = async (taskId) => {
    setTaskSyncStates((s) => ({ ...s, [taskId]: "loading" }));
    try {
      const result = await api.syncTaskToGoogle(taskId);
      setTaskSyncStates((s) => ({ ...s, [taskId]: result.status === "success" ? "success" : result.status }));
    } catch {
      setTaskSyncStates((s) => ({ ...s, [taskId]: "error" }));
    }
  };

  const syncAllHearings = async () => {
    setBulkCalendarState("loading");
    try {
      const result = await api.syncAllHearings();
      setBulkCalendarState(result.status === "success" ? "success" : result.status);
    } catch {
      setBulkCalendarState("error");
    }
  };

  const syncAllTasks = async () => {
    setBulkTaskState("loading");
    try {
      const result = await api.syncAllTasks();
      setBulkTaskState(result.status === "success" ? "success" : result.status);
    } catch {
      setBulkTaskState("error");
    }
  };

  const hasOverdue = brief.overdue_tasks.length > 0;

  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────── */}
      <section className="rounded-[32px] border border-stone-200/70 bg-white/85 p-6 shadow-panel">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-stone-400">Daily Briefing</p>

        <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl leading-tight text-ink">
              Good morning,<br />
              <span className="text-[#24286f]">{advocateName}</span>
            </h1>
            <p className="mt-1.5 text-sm text-stone-500">{formatHumanDate(brief.date)}</p>
          </div>

          {/* Status badge — inline, not overlapping */}
          <div className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold ${
            hasOverdue
              ? "bg-red-50 text-red-700 border border-red-100"
              : "bg-emerald-50 text-emerald-700 border border-emerald-100"
          }`}>
            {hasOverdue
              ? <AlertCircle className="h-4 w-4 shrink-0" />
              : <CheckCircle2 className="h-4 w-4 shrink-0" />}
            <span>
              {hasOverdue
                ? `${brief.overdue_tasks.length} item${brief.overdue_tasks.length > 1 ? "s" : ""} need attention`
                : "Desk is clear"}
            </span>
          </div>
        </div>

        {/* Stats — 2×2 grid, works in any width */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {statConfig.map(({ key, label, icon: Icon }) => (
            <div key={key} className="rounded-[22px] border border-stone-200 bg-paper px-4 py-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-stone-500 truncate">{label}</p>
                <Icon className="h-4 w-4 shrink-0 text-brass" />
              </div>
              <p className="mt-3 font-display text-4xl text-ink">{brief.stats[key]}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Today's hearings ───────────────────────────── */}
      <section className="rounded-[32px] border border-stone-200/70 bg-white/85 p-6 shadow-panel">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Today's Hearings</p>
            <h2 className="mt-1 font-display text-2xl text-ink">
              {brief.todays_hearings.length > 0
                ? `${brief.todays_hearings.length} hearing${brief.todays_hearings.length > 1 ? "s" : ""} today`
                : "Court is quiet today"}
            </h2>
          </div>
          <CalendarSyncButton onClick={syncAllHearings} state={bulkCalendarState} />
        </div>

        <div className="mt-5 space-y-3">
          {brief.todays_hearings.length ? (
            brief.todays_hearings.map((hearing) => (
              <HearingCard
                key={hearing.id}
                hearing={hearing}
                syncState={hearingSyncStates[hearing.id] || (hearing.calendar_synced ? "success" : "idle")}
                onSync={() => syncHearing(hearing.id)}
              />
            ))
          ) : (
            <div className="rounded-[22px] border border-dashed border-stone-200 bg-stone-50/50 px-5 py-4 text-sm text-stone-500">
              No hearings scheduled for today.
            </div>
          )}
        </div>
      </section>

      {/* ── Overdue tasks ──────────────────────────────── */}
      <section className="rounded-[32px] border border-stone-200/70 bg-white/85 p-6 shadow-panel">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Overdue Tasks</p>
            <h2 className="mt-1 font-display text-2xl text-ink">
              {hasOverdue
                ? `${brief.overdue_tasks.length} task${brief.overdue_tasks.length > 1 ? "s" : ""} overdue`
                : "Nothing overdue"}
            </h2>
          </div>
          <TaskSyncButton onClick={syncAllTasks} state={bulkTaskState} />
        </div>

        <div className="mt-5 space-y-3">
          {brief.overdue_tasks.length ? (
            brief.overdue_tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                syncState={taskSyncStates[task.id] || (task.google_tasks_synced ? "success" : "idle")}
                onSync={() => syncTask(task.id)}
              />
            ))
          ) : (
            <div className="rounded-[22px] border border-dashed border-stone-200 bg-stone-50/50 px-5 py-4 text-sm text-stone-500">
              Nothing overdue. A very respectable state of affairs.
            </div>
          )}
        </div>
      </section>

      {/* ── Weekly rhythm ──────────────────────────────── */}
      <section className="rounded-[32px] border border-stone-200/70 bg-white/85 p-6 shadow-panel">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Upcoming This Week</p>
            <h2 className="mt-1 font-display text-2xl text-ink">Hearing rhythm</h2>
          </div>
        </div>

        {brief.weekly_hearings.length ? (
          <div className="mt-5 flex gap-3 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-stone-200">
            {brief.weekly_hearings.map((entry) => (
              <div
                key={entry.date}
                className="flex min-w-[80px] flex-col items-center rounded-[20px] border border-stone-200 bg-paper px-3 py-4 text-center"
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-stone-500">
                  {new Date(entry.date).toLocaleDateString("en-IN", { weekday: "short" })}
                </p>
                <p className="mt-1 text-[10px] text-stone-400">{entry.date.slice(5)}</p>
                <p className="mt-3 font-display text-3xl text-ink">{entry.count}</p>
                <p className="mt-1 text-[10px] text-stone-500">hearings</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-[22px] border border-dashed border-stone-200 bg-stone-50/50 px-5 py-4 text-sm text-stone-500">
            No hearings lined up this week.
          </div>
        )}
      </section>

    </div>
  );
}
