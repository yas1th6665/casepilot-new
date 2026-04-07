import { useState } from "react";
import { Trash2 } from "lucide-react";
import PriorityBadge from "./PriorityBadge";
import { formatIndianDate } from "../utils/dateFormat";
import { useTaskStore } from "../stores/taskStore";

const STATUS_CYCLE = {
  pending: "in_progress",
  in_progress: "completed",
  completed: "pending",
};

const STATUS_LABEL = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Done",
};

const STATUS_STYLE = {
  pending: "bg-stone-100 text-stone-600",
  in_progress: "bg-blue-50 text-blue-700",
  completed: "bg-emerald-50 text-emerald-700",
};

export default function TaskCard({ task }) {
  const { updateStatus, removeTask } = useTaskStore();
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const currentStatus = task.status || "pending";
  const nextStatus = STATUS_CYCLE[currentStatus] || "in_progress";

  const handleStatusClick = async () => {
    if (updating) return;
    setUpdating(true);
    await updateStatus(task.id, nextStatus);
    setUpdating(false);
  };

  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    await removeTask(task.id);
  };

  return (
    <div className={`rounded-[24px] border bg-white p-4 shadow-sm transition-opacity ${deleting ? "opacity-40" : ""}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-stone-400">{task.case_number}</p>
          <h3 className="mt-1.5 text-sm font-semibold text-ink leading-snug">{task.title}</h3>
          <p className="mt-1 text-xs text-stone-500">
            {task.assigned_to === "self" ? "Assigned to you" : `Assigned to ${task.assigned_to}`}
          </p>
        </div>
        <PriorityBadge priority={task.priority} />
      </div>

      {task.description && (
        <p className="mt-3 text-xs leading-5 text-stone-500 line-clamp-2">{task.description}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {/* Clickable status pill — cycles through states */}
          <button
            type="button"
            onClick={handleStatusClick}
            disabled={updating}
            title={`Click to mark as ${STATUS_LABEL[nextStatus]}`}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition hover:opacity-80 ${STATUS_STYLE[currentStatus]}`}
          >
            {updating ? "..." : STATUS_LABEL[currentStatus]}
          </button>
          <span className="text-xs text-stone-400">Due {formatIndianDate(task.due_date)}</span>
        </div>

        {/* Delete */}
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          title="Delete task"
          className="rounded-full p-1.5 text-stone-300 transition hover:bg-red-50 hover:text-red-500"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
